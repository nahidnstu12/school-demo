'use server';

import { Prisma } from '@prisma/client';
import BaseService from './base.service';
import { prisma } from '@/lib/prisma';
import InstitutionDTO from '@/dtos/institution.dto';

/**
 * Institution service that extends the base service
 */
class InstitutionService extends BaseService<
  typeof prisma.institution,
  Prisma.InstitutionCreateInput,
  Prisma.InstitutionUpdateInput,
  typeof InstitutionDTO
> {
  constructor() {
    super(prisma.institution, InstitutionDTO);
  }
}

export default InstitutionService;
