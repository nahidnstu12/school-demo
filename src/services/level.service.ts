'use server';
import { Prisma } from '@prisma/client';
import BaseService from './base.service';
import { prisma } from '@/lib/prisma';
import LevelDTO from '@/dtos/level.dto';

class LevelService extends BaseService<
  typeof prisma.level,
  Prisma.LevelCreateInput,
  Prisma.LevelUpdateInput,
  typeof LevelDTO
> {
  constructor() {
    super(prisma.level, LevelDTO);
  }
}

export default LevelService;
