'use server';

import SubjectDTO from '@/backend/dtos/subject.dto';
import { Prisma, Subject } from '@prisma/client';
import BaseService from './base.service';
import SubjectModel from '@/backend/models/subject.model';

class SubjectService extends BaseService<
  Subject,
  Prisma.SubjectCreateInput,
  Prisma.SubjectUpdateInput,
  SubjectModel,
  typeof SubjectDTO
> {
  constructor(model: SubjectModel = new SubjectModel(), dto: typeof SubjectDTO = SubjectDTO) {
    super(model, dto);
  }
}

export default SubjectService;
