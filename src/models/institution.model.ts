'use server';

import { prisma } from '@/lib/prisma';
import BaseModel from './base.model';
import { Institution } from '@prisma/client';

class InstitutionModel extends BaseModel<Institution> {
  constructor() {
    super(prisma.institution);
  }
}

export default InstitutionModel;
