'use server';

import { prisma } from '@/lib/prisma';
import { Subject } from '@prisma/client';
import BaseModel from './base.model';

class SubjectModel extends BaseModel<Subject> {
  constructor() {
    super(prisma.subject);
  }
}

export default SubjectModel;
