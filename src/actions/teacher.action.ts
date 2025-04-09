'use server';
import { Teacher, Prisma } from '@prisma/client';
import { z } from 'zod';
import { TeacherFormValues, teacherSchema } from '@/schemas/teacher';
import TeacherService from '@/services/teacher.service';
import { teacherFilterConfig } from '@/schemas/teacher';
import InstitutionService from '@/services/institution.service';
import { ActionResult } from './IServerAction';
import {
  RelationalServerAction,
  RelationFieldMapping,
  RelationalFilterConfig,
} from './relation.action';

// Define a mapping for relation fields
const teacherRelationMapping: RelationFieldMapping = {
  // User relation fields
  fullName: { relation: 'user', field: 'firstName', type: 'sort' }, // For sorting by name
  email: { relation: 'user', field: 'email' },
  phone: { relation: 'user', field: 'phone' },
  firstName: { relation: 'user', field: 'firstName' },
  lastName: { relation: 'user', field: 'lastName' },

  // Institution relation fields
  institutionName: { relation: 'institution', field: 'name' },
};

// Convert the teacherFilterConfig to a RelationalFilterConfig
const teacherRelationalConfig: RelationalFilterConfig = {
  defaultPageSize: teacherFilterConfig.defaultPageSize,
  defaultSort: teacherFilterConfig.defaultSort,
  fields: {
    ...teacherFilterConfig.fields,
    // Add explicit relation information
    email: {
      type: 'string',
      defaultOperator: 'contains',
      relation: 'user',
      relationField: 'email',
    },
    phone: {
      type: 'string',
      defaultOperator: 'contains',
      relation: 'user',
      relationField: 'phone',
    },
  },
  relationMappings: teacherRelationMapping,
  // Define search fields explicitly
  searchFields: [
    { relation: 'user', relationField: 'firstName', field: 'firstName' },
    { relation: 'user', relationField: 'lastName', field: 'lastName' },
    { relation: 'user', relationField: 'email', field: 'email' },
    { relation: 'user', relationField: 'phone', field: 'phone' },
    // { field: 'pdsId' },
    // { field: 'designation' },
  ],
};

class TeacherServerAction extends RelationalServerAction<
  TeacherFormValues,
  Prisma.TeacherCreateInput,
  Prisma.TeacherUpdateInput,
  Teacher,
  TeacherService
> {
  private institutionService: InstitutionService;

  constructor(
    schema: z.ZodType<TeacherFormValues> = teacherSchema,
    service: TeacherService = new TeacherService(),
    institutionService: InstitutionService = new InstitutionService()
  ) {
    super(schema, service, teacherRelationalConfig, teacherRelationMapping);
    this.institutionService = institutionService;
  }

  /**
   * Get teachers with filtering - Uses the base class implementation
   */
  async getTeachersWithFilter(formData: FormData): Promise<ActionResult<any>> {
    return this.getItemsWithFilter(formData);
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
