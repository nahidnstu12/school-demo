'use server';

import { Subject } from '@prisma/client';

class SubjectDTO {
  static toList(subject: Subject) {
    return {
      id: subject.id,
      name: subject.name,
      code: subject.code,
      status: subject.status,
    };
  }

  static toDetail(subject: Subject) {
    return {
      id: subject.id,
      name: subject.name,
      code: subject.code,
      creditHours: subject.creditHours,
      description: subject.description,
      status: subject.status,
      institutionId: subject.institutionId,
      levelId: subject.levelId,
    };
  }
}

export default SubjectDTO;
