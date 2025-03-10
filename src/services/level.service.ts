'use server';
import { Level, Prisma } from '@prisma/client';
import BaseService from './base.service';
import { prisma } from '@/lib/prisma';
import LevelDTO from '@/dtos/level.dto';
import LevelModel from '@/models/level.model';

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
}

export default LevelService;
