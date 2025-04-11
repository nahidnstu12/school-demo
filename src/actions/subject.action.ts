'use server';

import SubjectService from '@/services/subject.service';
import BaseServerAction from './base.action';
import { SubjectFormValues, subjectSchema } from '@/schemas/subject';
import { Prisma, Subject } from '@prisma/client';
import { z } from 'zod';
import {
  RelationalFilterConfig,
  RelationalServerAction,
  RelationFieldMapping,
} from './relation.action';
import { filterConfig } from '@/utils/default-value';

const subjectRelationMapping: RelationFieldMapping = {
  institutionId: { relation: 'institution', field: 'name' },
  levelId: { relation: 'level', field: 'name' },
};

const subjectRelationalConfig: RelationalFilterConfig = {
  defaultPageSize: filterConfig.defaultPageSize,
  defaultSort: filterConfig.defaultSort,
  fields: {
    name: { type: 'string', defaultOperator: 'contains', urlParam: 'search' },
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
    service: SubjectService = new SubjectService(),
    relationalConfig: RelationalFilterConfig = subjectRelationalConfig,
    relationMapping: RelationFieldMapping = subjectRelationMapping
  ) {
    super(schema, service, relationalConfig, relationMapping);
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

export async function getSubjectsWithFilter(formData: FormData) {
  return subjectActionInstance.getItemsWithFilter(formData);
}
