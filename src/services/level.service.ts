'use server';
import LevelDTO from '@/dtos/level.dto';
import LevelModel from '@/models/level.model';
import { Level, Prisma } from '@prisma/client';
import BaseService from './base.service';

class LevelService extends BaseService<
  Level,
  Prisma.LevelCreateInput,
  Prisma.LevelUpdateInput,
  LevelModel,
  typeof LevelDTO
> {
  constructor(model: LevelModel = new LevelModel(), dto: typeof LevelDTO = LevelDTO) {
    super(model, dto);
  }

  async checkNameExists(name: string, institutionId: string, levelId?: string) {
    const existingLevels = await this.model.findMany({
      where: {
        name,
        institutionId,
        ...(levelId ? { id: { not: levelId } } : {}),
      },
      take: 1, // Only need one result to confirm existence
    });

    return existingLevels.length > 0;
  }

  async create(data: Prisma.LevelCreateInput) {
    const institutionId = (data as any).institutionId;
    // Check for duplicate level name
    const nameExists = await this.checkNameExists(data.name, institutionId as string);
    if (nameExists) {
      throw new Error(`A level with the name "${data.name}" already exists in this institution`);
    }

    return super.create(data);
  }
}

export default LevelService;
