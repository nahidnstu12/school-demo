'use server';

import UserDTO from '@/dtos/user.dto';
import UserModel from '@/models/user.model';
import { Prisma, User, UserRole } from '@prisma/client';
import BaseService from './base.service';

/**
 * User service that extends the base service
 */
class UserService extends BaseService<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  UserModel,
  typeof UserDTO
> {
  constructor(model: UserModel = new UserModel(), dto: typeof UserDTO = UserDTO) {
    super(model, dto);
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
