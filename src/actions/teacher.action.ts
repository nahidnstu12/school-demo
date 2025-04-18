'use server';
import { Teacher, Prisma } from '@prisma/client';
import { z } from 'zod';
import { TeacherFormValues, teacherSchema } from '@/schemas/teacher';
import TeacherService from '@/services/teacher.service';
import { teacherFilterConfig } from '@/schemas/teacher';
import InstitutionService from '@/services/institution.service';
import { ActionResult } from './IServerAction';
import { RelationalServerAction, RelationalFilterConfig } from './relation.action';

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
    fullName: {
      type: 'string',
      defaultOperator: 'contains',
      relation: 'user',
      relationField: 'firstName',
    },
  },
  include: {
    user: true,
    institution: true,
  },
  // Define search fields explicitly
  searchFields: [
    { relation: 'user', relationField: 'firstName', field: 'firstName' },
    { relation: 'user', relationField: 'lastName', field: 'lastName' },
    { relation: 'user', relationField: 'email', field: 'email' },
    { relation: 'user', relationField: 'phone', field: 'phone' },
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
    super(schema, service, teacherRelationalConfig);
    this.institutionService = institutionService;
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
}

// Create singleton instance
const TeacherActionInstance = new TeacherServerAction();

// Export reusable functions
export async function getTeachersWithFilter(formData: FormData) {
  return TeacherActionInstance.getItemsWithFilter(formData);
}

export async function getTeacherDesignations() {
  return TeacherActionInstance.getTeacherDesignations();
}
