'use server';

import { subjectFilterConfig, SubjectFormValues, subjectSchema } from '@/schemas/subject';
import SubjectService from '@/backend/services/subject.service';
import { Prisma, Subject } from '@prisma/client';
import { z, ZodType } from 'zod';
import { RelationalFilterConfig, RelationalServerAction } from './relation.action';
import { ActionResult } from './IServerAction';

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
    schema: z.ZodType<SubjectFormValues> = subjectSchema as ZodType<SubjectFormValues>,
    service: SubjectService = new SubjectService()
  ) {
    super(schema, service, subjectRelationalConfig);
  }
}

// Create a single instance
const subjectActionInstance = new SubjectServerAction();

// Export standard CRUD functions
export async function createSubject(prevState: ActionResult<Subject>, formData: FormData) {
  console.log('createSubject action>>', formData);
  return subjectActionInstance.create(formData);
}

export async function updateSubject(prevState: ActionResult<Subject>, id: string | number, formData: FormData) {
  return subjectActionInstance.update(id, formData);
}

export async function deleteSubject(id: string | number) {
  return subjectActionInstance.delete(id);
}

export async function getSubjectById(id: string | number) {
  console.log("subject id action>>", id);
  
  return subjectActionInstance.findOne({ where: {id}, include: { institution: true, level: true } });
}

export async function getSubjectsWithFilter(formData: FormData) {
  return subjectActionInstance.getItemsWithFilter(formData);
}

export async function getAllSubjects(filters: any) {
  return subjectActionInstance.getAll(filters);
}