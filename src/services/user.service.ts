'use server';

import { Prisma, User, UserRole } from '@prisma/client';
import BaseService from './base.service';
import { prisma } from '@/lib/prisma';
import UserDTO from '@/dtos/user.dto';

/**
 * User service that extends the base service
 */
class UserService extends BaseService<
  typeof prisma.user,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  typeof UserDTO
> {
  constructor() {
    super(prisma.user, UserDTO);
  }

  /**
   * Custom method example - find users by role
   */
  async findByRole(role: UserRole) {
    const users = await this.model.findMany({
      where: { role },
    });
    return this.transformData(users, 'toList');
  }

  /**
   * Renamed findAll to testCase
   */
  async testCase(filters?: Prisma.UserFindManyArgs) {
    return this.findAll(filters, 'toList');
  }
}

export default UserService;
