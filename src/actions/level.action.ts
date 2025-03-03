'use server';

import LevelService from '@/services/level.service';
import BaseServerAction from './base.action';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { levelSchema } from '@/types/level';

class LevelServerAction extends BaseServerAction<z.infer<typeof levelSchema>> {
  constructor() {
    super(levelSchema);
  }

  async createLevel(
    formData: FormData
  ): Promise<
    | { success: true; Level: any }
    | { success: false; errors: { field: string | number; message: string }[] }
  > {
    console.log(formData, 'server action form data');
    const validatedData = this.validateFormData(formData);

    if (!validatedData.success) return validatedData;

    const Level = await new LevelService().create(validatedData.data as Prisma.LevelCreateInput);
    return { success: true, Level };
  }
}
const LevelActionInstance = new LevelServerAction();

export async function createLevel(formData: FormData) {
  return LevelActionInstance.createLevel(formData);
}

// export default LevelActionInstance;
