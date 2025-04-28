import { Institution, Level, Subject } from '@prisma/client';

// Define extended Subject type with relations
interface SubjectWithRelations extends Subject {
  institution: Institution;
  level?: Level;
}

class SubjectDTO {
  // Static method to create a list version with limited properties
  static toList(subject: SubjectWithRelations): Partial<SubjectDTO> {
    return {
      id: subject.id,
      name: subject.name,
      code: subject.code,
      status: subject.status,
      institutionName: subject?.institution?.name,
      levelId: subject.levelId,
      levelName: subject?.level?.name,
      creditHours: subject.creditHours,
      createdAt: subject.createdAt,
    };
  }

  // Static method to create a detailed version with all properties
  static toDetail(subject: SubjectWithRelations): Partial<SubjectDTO> {
    return {
      id: subject.id,
      name: subject.name,
      code: subject.code,
      creditHours: subject.creditHours ?? null,
      description: subject.description ?? null,
      status: subject.status,
      institutionId: subject.institutionId,
      institutionName: subject.institution.name,
      levelId: subject.levelId,
      levelName: subject.level?.name ?? null,
    };
  }
}

export default SubjectDTO;
