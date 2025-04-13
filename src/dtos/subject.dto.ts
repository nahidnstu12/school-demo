import { Institution, Level, Subject } from '@prisma/client';

// Define extended Subject type with relations
interface SubjectWithRelations extends Subject {
  institution: Institution;
  level?: Level;
}

class SubjectDTO {
  constructor(
    subject: SubjectWithRelations,
    public id: string = subject.id,
    public name: string = subject.name,
    public code: string | null = subject.code,
    public creditHours: number | null = subject.creditHours ?? null,
    public description: string | null = subject.description ?? null,
    public status: boolean = subject.status,
    public institutionId: string = subject.institutionId,
    public institutionName: string = subject?.institution?.name,
    public levelId: string | null = subject.levelId ?? null,
    public levelName: string | null = subject.level?.name ?? null
  ) {}

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
