'use server';

import LevelService from '@/services/level.service';
import BaseServerAction from './base.action';
import { Level, Prisma } from '@prisma/client';
import { z } from 'zod';
import { levelSchema } from '@/schemas/level';

class LevelServerAction extends BaseServerAction<
  z.infer<typeof levelSchema>,
  Prisma.LevelCreateInput,
  Prisma.LevelUpdateInput,
  Level,
  LevelService
> {
  constructor() {
    super(levelSchema, new LevelService());
  }
}
const LevelActionInstance = new LevelServerAction();

export async function createLevel(formData: FormData) {
  return LevelActionInstance.create(formData);
}

// export default LevelActionInstance;
