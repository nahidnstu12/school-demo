'use server';

import { prisma } from '@/lib/prisma';
import { Teacher } from '@prisma/client';
import BaseModel from './base.model';

class TeacherModel extends BaseModel<Teacher> {
  constructor() {
    super(prisma.teacher);
  }
}

export default TeacherModel;
