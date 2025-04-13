'use server';

import { prisma } from '@/lib/prisma';
import BaseModel from './base.model';
import { User } from '@prisma/client';

class UserModel extends BaseModel<User> {
  constructor() {
    super(prisma.user);
  }
}

export default UserModel;
