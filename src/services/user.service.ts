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
}

export default UserService;
