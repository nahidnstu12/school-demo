'use server';

import { prisma } from '@/lib/prisma';
import BaseModel from './base.model';
import { Level } from '@prisma/client';

class LevelModel extends BaseModel<Level> {
  constructor() {
    super(prisma.level);
  }
}

export default LevelModel;
