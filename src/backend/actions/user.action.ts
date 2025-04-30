'use server';

import UserService from '@/backend/services/user.service';
import { UserFormValues, userSchema } from '@/schemas/user';
import { Prisma, User } from '@prisma/client';
import { z } from 'zod';
import BaseServerAction from './base.action';

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
