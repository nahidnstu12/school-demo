'use server';

import { prisma } from '@/lib/prisma';
import BaseModel from './base.model';
import { Teacher, Prisma } from '@prisma/client';

class TeacherModel extends BaseModel<Teacher> {
  constructor() {
    super(prisma.teacher);
  }

  // Override findFirst to include user and institution relations
  async findFirst(args?: Prisma.TeacherFindFirstArgs): Promise<Teacher | null> {
    return this.model.findFirst({
      ...args,
      include: {
        user: true,
        institution: true,
      },
    });
  }
}

export default TeacherModel;
