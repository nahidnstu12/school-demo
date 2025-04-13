import { Teacher, User, Institution } from '@prisma/client';

// Define extended Teacher type with relations
interface TeacherWithRelations extends Teacher {
  user: User;
  institution: Institution;
}

class TeacherDTO {
  id: string;
  fullName: string;
  institutionName: string;
  institutionId: string;
  phone: string | null;
  email: string;
  pdsId: string | null;
  designation: string;
  joiningDate: Date | null;
  status: boolean;

  constructor(teacher: TeacherWithRelations) {
    this.id = teacher.id;
    this.fullName = `${teacher.user.firstName} ${teacher.user.lastName}`;
    this.institutionName = teacher.institution.name;
    this.institutionId = teacher.institutionId;
    this.phone = teacher.user.phone;
    this.email = teacher.user.email;
    this.pdsId = teacher.pdsId;
    this.designation = teacher.designation;
    this.joiningDate = teacher.joiningDate;
    this.status = teacher.status;
  }

  // Static method to transform an array of teachers
  static transformMany(teachers: TeacherWithRelations[]): TeacherDTO[] {
    return teachers.map((teacher) => new TeacherDTO(teacher));
  }

  // Static method to transform a single teacher
  static transform(teacher: TeacherWithRelations): TeacherDTO {
    return new TeacherDTO(teacher);
  }
}

export default TeacherDTO;
