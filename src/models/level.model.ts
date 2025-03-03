'use server';

import { prisma } from '@/lib/prisma';
import BaseModel from './base.model';

class LevelModel extends BaseModel<typeof prisma.level> {
  constructor() {
    super(prisma.level);
  }
}

export default LevelModel;
