'use server';

import { Teacher, Prisma } from '@prisma/client';
import { z } from 'zod';
import { TeacherFormValues, teacherSchema } from '@/schemas/teacher';
import BaseServerAction from './base.action';
import TeacherService from '@/services/teacher.service';
import { headers } from 'next/headers';
import { teacherFilterConfig } from '@/schemas/teacher';
import InstitutionService from '@/services/institution.service';
import { ActionResult } from './IServerAction';

class TeacherServerAction extends BaseServerAction<
  TeacherFormValues,
  Prisma.TeacherCreateInput,
  Prisma.TeacherUpdateInput,
  Teacher,
  TeacherService
> {
  constructor(
    schema: z.ZodType<TeacherFormValues> = teacherSchema,
    service: TeacherService = new TeacherService(),
    private institutionService: InstitutionService = new InstitutionService()
  ) {
    super(schema, service);
  }

  /**
   * Get teachers with filtering
   */
  async getTeachersWithFilter(formData: FormData): Promise<ActionResult<any>> {
    try {
      const headersList = await headers();
      const url = headersList.get('x-url') || headersList.get('referer') || '';
      const searchParams = new URL(url).searchParams;

      // Extract pagination and sorting parameters from URL
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(
        searchParams.get('pageSize') || String(teacherFilterConfig.defaultPageSize)
      );
      const sortField = searchParams.get('sort') || 'joiningDate';
      const sortDirection = (searchParams.get('dir') || 'desc') as 'asc' | 'desc';

      // Get search term from search parameter
      const searchTerm = searchParams.get('search') || '';

      console.log('Server action using:', { page, pageSize, sortField, sortDirection, searchTerm });

      // Build filter object from form data
      let filterObject: any = {};
      const filterJson = formData.get('filter') as string;

      if (filterJson) {
        try {
          filterObject = JSON.parse(filterJson);

          // Dump the raw filter object for debugging
          console.log('Raw filter object:', JSON.stringify(filterObject, null, 2));

          // Ensure pagination settings use URL values
          filterObject.skip = (page - 1) * pageSize;
          filterObject.take = pageSize;

          // Process the filter object to handle special fields and relations
          this.processFilterObject(filterObject);
        } catch (error) {
          console.error('Error parsing filter JSON:', error);
          filterObject = {
            skip: (page - 1) * pageSize,
            take: pageSize,
            where: {},
          };
        }
      } else {
        filterObject = {
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {},
        };
      }

      // Ensure sorting settings use URL values
      if (sortField) {
        filterObject.orderBy = { [sortField]: sortDirection };
      }

      // Add global search if present
      if (searchTerm) {
        this.addGlobalSearch(filterObject, searchTerm);
      }

      // Log the final processed filter object
      console.log('Processed filter object:', JSON.stringify(filterObject, null, 2));

      // Get data with pagination
      const results = await this.service.findAllPaginated(page, pageSize, filterObject);

      return { success: true, data: results };
    } catch (error) {
      console.error('Detailed error:', error);
      return this.handleServiceError(error);
    }
  }

  /**
   * Process the filter object to handle special fields and relation mappings
   */
  private processFilterObject(filterObject: any): void {
    if (!filterObject.where) return;

    // Helper function to process a single condition
    const processCondition = (condition: any): any => {
      if (!condition) return condition;

      // Create a new processed condition
      const processedCondition: any = {};

      // Process each field in the condition
      Object.entries(condition).forEach(([key, value]) => {
        // Handle nested AND conditions
        if (key === 'AND' && Array.isArray(value)) {
          processedCondition.AND = (value as any[]).map((c) => processCondition(c));
          return;
        }

        // Handle nested OR conditions
        if (key === 'OR' && Array.isArray(value)) {
          processedCondition.OR = (value as any[]).map((c) => processCondition(c));
          return;
        }

        // Handle nested NOT conditions
        if (key === 'NOT' && Array.isArray(value)) {
          processedCondition.NOT = (value as any[]).map((c) => processCondition(c));
          return;
        }

        // Handle relation fields
        if (key === 'email') {
          // Map email to user.email
          processedCondition.user = { email: value };
        } else if (key === 'phone') {
          // Map phone to user.phone
          processedCondition.user = { phone: value };
        } else if (key.startsWith('user_')) {
          // Map user_* fields to user.*
          const userField = key.replace('user_', '');
          processedCondition.user = { [userField]: value };
        } else if (key === 'institutionName') {
          // Map institutionName to institution.name
          processedCondition.institution = { name: value };
        } else if (key === 'search') {
          // Skip search - handled separately
          return;
        } else {
          // Keep direct fields as-is
          processedCondition[key] = value;
        }
      });

      return processedCondition;
    };

    // Process the top-level where condition
    if (filterObject.where.AND) {
      // Process AND conditions
      filterObject.where.AND = Array.isArray(filterObject.where.AND)
        ? filterObject.where.AND.map(processCondition)
        : [processCondition(filterObject.where.AND)];
    } else if (filterObject.where.OR) {
      // Process OR conditions
      filterObject.where.OR = Array.isArray(filterObject.where.OR)
        ? filterObject.where.OR.map(processCondition)
        : [processCondition(filterObject.where.OR)];
    } else {
      // Process direct conditions
      filterObject.where = processCondition(filterObject.where);
    }
  }

  /**
   * Add global search to the filter object
   */
  private addGlobalSearch(filterObject: any, searchTerm: string): void {
    if (!filterObject.where) {
      filterObject.where = {};
    }

    // Create search conditions that use proper relation paths
    const searchConditions = [
      { user: { firstName: { contains: searchTerm, mode: 'insensitive' } } },
      { user: { lastName: { contains: searchTerm, mode: 'insensitive' } } },
      { user: { email: { contains: searchTerm, mode: 'insensitive' } } },
      { user: { phone: { contains: searchTerm, mode: 'insensitive' } } },
      { pdsId: { contains: searchTerm, mode: 'insensitive' } },
      { designation: { contains: searchTerm, mode: 'insensitive' } },
    ];

    // Handle the different ways where conditions might be structured
    if (!filterObject.where.AND && !filterObject.where.OR) {
      // If there are no existing AND/OR conditions, create a new OR for search
      filterObject.where = {
        AND: [
          filterObject.where, // Keep existing direct conditions
          { OR: searchConditions }, // Add search conditions as OR
        ],
      };
    } else if (filterObject.where.AND) {
      // If there's an existing AND, add our search as another item in the AND array
      if (!Array.isArray(filterObject.where.AND)) {
        filterObject.where.AND = [filterObject.where.AND];
      }
      filterObject.where.AND.push({ OR: searchConditions });
    } else if (filterObject.where.OR) {
      // If there's an existing OR, wrap everything in an AND
      const existingOr = filterObject.where.OR;
      filterObject.where = {
        AND: [
          { OR: existingOr }, // Keep existing OR conditions
          { OR: searchConditions }, // Add search conditions as OR
        ],
      };
    }
  }

  /**
   * Get all designations for dropdown
   */
  async getTeacherDesignations(): Promise<ActionResult<string[]>> {
    try {
      const designations = await this.service.getAllDesignations();
      return { success: true, data: designations };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Get all institutions for dropdown
   */
  async getInstitutions(): Promise<ActionResult<any[]>> {
    try {
      const institutions = await this.institutionService.findAll();
      return { success: true, data: institutions };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }
}

// Create singleton instance
const TeacherActionInstance = new TeacherServerAction();

// Export reusable functions
export async function getTeachersWithFilter(formData: FormData) {
  return TeacherActionInstance.getTeachersWithFilter(formData);
}

export async function getTeacherDesignations() {
  return TeacherActionInstance.getTeacherDesignations();
}

export async function getInstitutions() {
  return TeacherActionInstance.getInstitutions();
}
