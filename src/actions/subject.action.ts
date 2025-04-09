'use server';

import SubjectService from '@/services/subject.service';
import BaseServerAction from './base.action';
import { SubjectFormValues, subjectSchema } from '@/schemas/subject';
import { Prisma, Subject } from '@prisma/client';
import { z } from 'zod';

class SubjectServerAction extends BaseServerAction<
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
    super(schema, service);
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

export async function getAllSubjects(filters?: Prisma.SubjectFindManyArgs) {
  return subjectActionInstance.getAll(filters);
}
