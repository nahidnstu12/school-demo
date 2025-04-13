import { Teacher, User, Institution } from '@prisma/client';

// Define extended Teacher type with relations
interface TeacherWithRelations extends Teacher {
  user: User;
  institution: Institution;
}

class TeacherDTO {
  constructor(
    teacher: TeacherWithRelations,
    public id: string = teacher.id,
    public fullName: string = `${teacher.user.firstName} ${teacher.user.lastName}`,
    public institutionName: string = teacher.institution.name,
    public institutionId: string = teacher.institutionId,
    public phone: string | null = teacher.user.phone,
    public email: string = teacher.user.email,
    public pdsId: string | null = teacher.pdsId,
    public designation: string = teacher.designation,
    public joiningDate: Date | null = teacher.joiningDate,
    public status: boolean = teacher.status
  ) {}
}

export default TeacherDTO;
