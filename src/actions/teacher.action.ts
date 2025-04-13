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
      const searchTerm = searchParams.get('search') || '';

      console.log('Server action using:', { page, pageSize, sortField, sortDirection, searchTerm });

      // Build filter object from form data
      let filterObject: any = {};
      const filterJson = formData.get('filter') as string;

      if (filterJson) {
        try {
          filterObject = JSON.parse(filterJson);

          // Ensure pagination settings use URL values
          filterObject.skip = (page - 1) * pageSize;
          filterObject.take = pageSize;
        } catch (error) {
          console.error('Error parsing filter JSON:', error);
          filterObject = {};
        }
      }

      // Ensure sorting settings use URL values
      if (sortField) {
        filterObject.orderBy = { [sortField]: sortDirection };
      }

      // Handle name search (firstName + lastName in User model)
      if (
        searchTerm &&
        (!filterObject.where || !this.hasNameSearchCondition(filterObject.where, searchTerm))
      ) {
        if (!filterObject.where) {
          filterObject.where = {};
        }

        // Add search for first name or last name
        filterObject.where.OR = [
          { user: { firstName: { contains: searchTerm, mode: 'insensitive' } } },
          { user: { lastName: { contains: searchTerm, mode: 'insensitive' } } },
          { user: { email: { contains: searchTerm, mode: 'insensitive' } } },
          { user: { phone: { contains: searchTerm, mode: 'insensitive' } } },
          { pdsId: { contains: searchTerm, mode: 'insensitive' } },
        ];
      }

      console.log('Final filter object:', JSON.stringify(filterObject, null, 2));

      // Get data with pagination
      const results = await this.service.findAllPaginated(page, pageSize, filterObject);

      return { success: true, data: results };
    } catch (error) {
      return this.handleServiceError(error);
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

  /**
   * Helper function to check if name search condition already exists
   */
  private hasNameSearchCondition(where: any, searchTerm: string): boolean {
    if (!where) return false;

    if (where.OR && Array.isArray(where.OR)) {
      for (const condition of where.OR) {
        if (
          condition.user?.firstName?.contains === searchTerm ||
          condition.user?.lastName?.contains === searchTerm ||
          condition.user?.email?.contains === searchTerm ||
          condition.user?.phone?.contains === searchTerm ||
          condition.pdsId?.contains === searchTerm
        ) {
          return true;
        }
      }
    }

    return false;
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
