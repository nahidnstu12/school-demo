'use server';

import InstitutionService from '@/services/institution.service';
import BaseServerAction from './base.action';
import { Institution, Prisma } from '@prisma/client';
import { z } from 'zod';
import { institutionSchema } from '@/schemas/institution';

class InstitutionServerAction extends BaseServerAction<
  z.infer<typeof institutionSchema>,
  Prisma.InstitutionCreateInput,
  Prisma.InstitutionUpdateInput,
  Institution,
  InstitutionService
> {
  constructor() {
    super(institutionSchema, new InstitutionService());
  }
}
const InstitutionActionInstance = new InstitutionServerAction();

export async function createInstitution(formData: FormData) {
  return InstitutionActionInstance.create(formData);
}

export async function getAllInstitutions(filters?: Prisma.InstitutionFindManyArgs) {
  return InstitutionActionInstance.getAll(filters);
}
