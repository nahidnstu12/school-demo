'use server';

import { prisma } from '@/lib/prisma';
import BaseModel from './base.model';

class UserModel extends BaseModel<typeof prisma.user> {
  constructor() {
    super(prisma.user);
  }
}

export default UserModel;
