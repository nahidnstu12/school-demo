'use server';

import { prisma } from '@/lib/prisma';
import BaseModel from './base.model';

class InstitutionModel extends BaseModel<typeof prisma.institution> {
  constructor() {
    super(prisma.institution);
  }
}

export default InstitutionModel;
