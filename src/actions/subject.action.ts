'use server';

import { subjectFilterConfig, SubjectFormValues, subjectSchema } from '@/schemas/subject';
import SubjectService from '@/services/subject.service';
import { Prisma, Subject } from '@prisma/client';
import { z } from 'zod';
import { RelationalFilterConfig, RelationalServerAction } from './relation.action';

const subjectRelationalConfig: RelationalFilterConfig = {
  defaultPageSize: subjectFilterConfig.defaultPageSize,
  defaultSort: subjectFilterConfig.defaultSort,
  fields: {
    ...subjectFilterConfig.fields,
  },
  include: {
    institution: true,
    level: true,
  },
};

class SubjectServerAction extends RelationalServerAction<
  SubjectFormValues,
  Prisma.SubjectCreateInput,
  Prisma.SubjectUpdateInput,
  Subject,
  SubjectService
> {
  constructor(
    schema: z.ZodType<SubjectFormValues> = subjectSchema,
    service: SubjectService = new SubjectService()
  ) {
    super(schema, service, subjectRelationalConfig);
  }
}

// Create a single instance
const subjectActionInstance = new SubjectServerAction();

// Export standard CRUD functions
export async function createSubject(formData: FormData) {
  return subjectActionInstance.create(formData);
}

export async function updateSubject(id: string | number, formData: FormData) {
  return subjectActionInstance.update(id, formData);
}

export async function deleteSubject(id: string | number) {
  return subjectActionInstance.delete(id);
}

export async function getSubjectById(id: string | number) {
  return subjectActionInstance.getById(id);
}

export async function getSubjectsWithFilter(formData: FormData) {
  return subjectActionInstance.getItemsWithFilter(formData);
}
