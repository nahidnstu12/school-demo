'use server';
import { Prisma } from '@prisma/client';
import BaseService from './base.service';
import { prisma } from '@/lib/prisma';
import UserDTO from '@/dto/user.dto';

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
   *
   *  method name was 'findAll' but renamed to 'testCase'
   * @param [filters]
   */
  async testCase(filters?: Prisma.Args<typeof prisma.user, 'findMany'>) {
    return super.findAll(filters, 'toList'); // Default transform method
  }
}

export default UserService;
