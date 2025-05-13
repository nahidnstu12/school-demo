'use server';

import InstitutionService from '@/backend/services/institution.service';
import TeacherService from '@/backend/services/teacher.service';
import { prisma } from '@/lib/prisma';
import { teacherFilterConfig, teacherFormSchema, TeacherFormValues, TeacherWithUser } from '@/schemas/teacher';
import { Prisma, Teacher } from '@prisma/client';
import { z, ZodType } from 'zod';
import { ActionResult } from './IServerAction';
import { RelationalFilterConfig, RelationalServerAction } from './relation.action';

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
    schema: z.ZodType<TeacherFormValues> = teacherFormSchema as ZodType<TeacherFormValues>,
    service: TeacherService = new TeacherService(),
    institutionService: InstitutionService = new InstitutionService()
  ) {
    super(schema, service, teacherRelationalConfig);
    this.institutionService = institutionService;
  }

  //   /**
  //    * Override the create method to handle both User and Teacher creation
  //    */
  async create(formData: FormData): Promise<ActionResult<Teacher>> {
    try {
      // Parse the form data
      const validated = this.validateFormData(formData);
      console.log('validated action>>', validated);

      if (!validated.success) {
        return validated;
      }

      // Transaction to ensure both User and Teacher are created or none
      const teacher = await prisma.$transaction(async (tx) => {
        // 1. Create the user
        const user = await tx.user.create({
          data: {
            firstName: validated.data.firstName,
            lastName: validated.data.lastName,
            email: validated.data.email,
            phone: validated.data.phone || null,
            // You'll need to implement password generation or set a default
            password: await this.generatePasswordHash('password123'), // Example, use a proper implementation
            role: 'TEACHER', // Set the appropriate role
          },
        });

        // 2. Create the teacher linked to the user
        const teacher = await tx.teacher.create({
          data: {
            userId: user.id,
            institutionId: validated.data.institutionId,
            designation: validated.data.designation,
            joiningDate: validated.data.joiningDate ? new Date(validated.data.joiningDate) : null,
            address: validated.data.address || null,
            district: validated.data.district || null,
            specialization: validated.data.specialization || null,
            pdsId: validated.data.pdsId || null,
            status: validated.data.status,
          },
        });

        return teacher;
      });

      return { success: true, data: teacher };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  async update(id: string, formData: FormData): Promise<ActionResult<Teacher>> {
    try {
      const validated = this.validateFormData(formData);
      console.log('validated action>>', validated);

      if (!validated.success) {
        return validated;
      }

      const teacher = await prisma.$transaction(async (tx) => {
        // 1. Create the user
        const user = await tx.user.update({
          where: { id: validated.data.userId },
          data: {
            firstName: validated.data.firstName,
            lastName: validated.data.lastName,
            email: validated.data.email,
            phone: validated.data.phone || null,
            // You'll need to implement password generation or set a default
            password: await this.generatePasswordHash('password123'), // Example, use a proper implementation
            role: 'TEACHER', // Set the appropriate role
          },
        });

        // 2. Create the teacher linked to the user
        const teacher = await tx.teacher.update({
          where: { id },
          data: {
            institutionId: validated.data.institutionId,
            designation: validated.data.designation,
            joiningDate: validated.data.joiningDate ? new Date(validated.data.joiningDate) : null,
            address: validated.data.address || null,
            district: validated.data.district || null,
            specialization: validated.data.specialization || null,
            pdsId: validated.data.pdsId || null,
            status: validated.data.status,
          },
        });
        return teacher;
      });
      return { success: true, data: teacher };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Helper method to generate a hashed password
   * This is just a placeholder - implement actual password hashing
   */
  private async generatePasswordHash(password: string): Promise<string> {
    // In a real application, use a proper password hashing library like bcrypt
    // For example: return await bcrypt.hash(password, 10);
    return password; // This is just for example purposes, DO NOT use in production
  }

  /**
   * Get all designations for dropdown
   */
  async getTeacherDesignations(): Promise<ActionResult<{ id: string; name: string }[]>> {
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

export async function createTeacher(prevState: ActionResult<Teacher>, formData: FormData) {
  return TeacherActionInstance.create(formData);
}

export async function updateTeacher(
  prevState: ActionResult<Teacher>,
  id: string,
  formData: FormData
) {
  return TeacherActionInstance.update(id, formData);
}

export async function deleteTeacher(id: string) {
  return TeacherActionInstance.delete(id);
}

export async function getTeacherById(id: string): Promise<ActionResult<TeacherWithUser | null>> {
  return TeacherActionInstance.findOne({
    where: { id },
    include: { user: true, institution: true },
  }) as Promise<ActionResult<TeacherWithUser | null>>;
}
