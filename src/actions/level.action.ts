'use server';

import LevelService from '@/services/level.service';
import BaseServerAction from './base.action';
import { Level, Prisma } from '@prisma/client';
import { z } from 'zod';
import { levelSchema, LevelSchemaType } from '@/schemas/level';

class LevelServerAction extends BaseServerAction<
  LevelSchemaType,
  Prisma.LevelCreateInput,
  Prisma.LevelUpdateInput,
  Level,
  LevelService
> {
  constructor(
    schema: z.ZodType<LevelSchemaType> = levelSchema,
    service: LevelService = new LevelService()
  ) {
    super(schema, service);
  }
}
const LevelActionInstance = new LevelServerAction();

export async function createLevel(formData: FormData) {
  return LevelActionInstance.create(formData);
}

// export default LevelActionInstance;
