'use server';

import InstitutionDTO from '@/dtos/institution.dto';
import InstitutionModel from '@/models/institution.model';
import { Institution, Prisma } from '@prisma/client';
import BaseService from './base.service';

/**
 * Institution service that extends the base service
 */
class InstitutionService extends BaseService<
  Institution,
  Prisma.InstitutionCreateInput,
  Prisma.InstitutionUpdateInput,
  InstitutionModel,
  typeof InstitutionDTO
> {
  constructor(
    model: InstitutionModel = new InstitutionModel(),
    dto: typeof InstitutionDTO = InstitutionDTO
  ) {
    super(model, dto);
  }
}

export default InstitutionService;
