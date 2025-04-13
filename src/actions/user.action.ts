'use server';

import UserService from '@/services/user.service';
import BaseServerAction from './base.action';
import { UserFormValues, userSchema } from '@/schemas/user';
import { Prisma, User, UserRole } from '@prisma/client';
import { z } from 'zod';

/**
 * Server actions for User entity
 */
class UserServerAction extends BaseServerAction<
  UserFormValues,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  User,
  UserService
> {
  constructor(
    schema: z.ZodType<UserFormValues> = userSchema,
    service: UserService = new UserService()
  ) {
    super(schema, service);
  }

  // You can add user-specific methods here if needed
  async createWithRole(
    formData: FormData,
    defaultRole: UserRole
  ): Promise<
    | { success: true; data: User }
    | { success: false; errors: { field: string | number; message: string }[] }
  > {
    const validatedData = this.validateFormData(formData);

    if (!validatedData.success) return validatedData;

    // Add a default role if not provided
    if (!validatedData.data.role) {
      validatedData.data.role = defaultRole;
    }

    try {
      const result = await this.service.create(validatedData.data as Prisma.UserCreateInput);
      return { success: true, data: result };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }
}

// Create a single instance
const userActionInstance = new UserServerAction();

// Export standard CRUD functions
export async function createUser(formData: FormData) {
  return userActionInstance.create(formData);
}

export async function updateUser(id: string | number, formData: FormData) {
  return userActionInstance.update(id, formData);
}

export async function deleteUser(id: string | number) {
  return userActionInstance.delete(id);
}

export async function getUserById(id: string | number) {
  return userActionInstance.getById(id);
}

export async function getAllUsers(filters?: Prisma.UserFindManyArgs) {
  return userActionInstance.getAll(filters);
}

// Export custom functions
export async function createUserWithRole(formData: FormData, defaultRole: UserRole) {
  return userActionInstance.createWithRole(formData, defaultRole);
}
