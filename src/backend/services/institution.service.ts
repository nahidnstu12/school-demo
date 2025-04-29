'use server';

import InstitutionDTO from '@/backend/dtos/institution.dto';
import InstitutionModel from '@/backend/models/institution.model';
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

  // async softDelete(id: number | string): Promise<Institution> {
  //   return await this.model.update(id, { deleted: true } as any);
  // }
}

export default InstitutionService;
