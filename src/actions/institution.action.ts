'use server';

import { Institution, Prisma } from '@prisma/client';
import { z } from 'zod';
import { InstitutionFormValues, institutionSchema } from '@/schemas/institution';
import BaseServerAction from './base.action';
import InstitutionService from '@/services/institution.service';

class InstitutionServerAction extends BaseServerAction<
  InstitutionFormValues,
  Prisma.InstitutionCreateInput,
  Prisma.InstitutionUpdateInput,
  Institution,
  InstitutionService
> {
  constructor(
    schema: z.ZodType<InstitutionFormValues> = institutionSchema,
    service: InstitutionService = new InstitutionService()
  ) {
    super(schema, service);
  }
}
const InstitutionActionInstance = new InstitutionServerAction();

export async function createInstitution(formData: FormData) {
  return InstitutionActionInstance.create(formData);
}

export async function getAllInstitutions(filters?: Prisma.InstitutionFindManyArgs) {
  return InstitutionActionInstance.getAll(filters);
}
