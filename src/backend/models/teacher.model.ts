'use server';

import { prisma } from '@/lib/prisma';
import { Teacher } from '@prisma/client';
import BaseModel from './base.model';

class TeacherModel extends BaseModel<Teacher> {
  constructor() {
    super(prisma.teacher);
  }

  // async findUnique(id: string | number): Promise<Teacher | null> {
  //   return await this.model.findUnique({
  //     where: { id },
  //     include: {
  //       user: true,
  //       institution: true,
  //     },
  //   });
  // }
}

export default TeacherModel;
