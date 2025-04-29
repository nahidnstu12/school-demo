import { Teacher, User, Institution } from '@prisma/client';

// Define extended Teacher type with relations
interface TeacherWithRelations extends Teacher {
  user: User;
  institution: Institution;
}

class TeacherDTO {
  /**
   * Transform teacher for list view (less detailed)
   */
  static toList(teacher: TeacherWithRelations) {
    return {
      id: teacher.id,
      fullName: `${teacher.user.firstName} ${teacher.user.lastName}`,
      institutionName: teacher.institution.name,
      designation: teacher.designation,
      status: teacher.status,
      email: teacher.user.email,
      phone: teacher.user.phone,
      joiningDate: teacher.joiningDate,
      pdsId: teacher.pdsId,
    };
  }

  /**
   * Transform teacher for detailed profile view
   */
  static toDetail(teacher: TeacherWithRelations) {
    return {
      id: teacher.id,
      fullName: `${teacher.user.firstName} ${teacher.user.lastName}`,
      firstName: teacher.user.firstName,
      lastName: teacher.user.lastName,
      institutionName: teacher.institution.name,
      institutionId: teacher.institutionId,
      phone: teacher.user.phone,
      email: teacher.user.email,
      pdsId: teacher.pdsId,
      designation: teacher.designation,
      joiningDate: teacher.joiningDate,
      status: teacher.status,
      // Can add computed properties here
      yearsOfService: teacher.joiningDate
        ? Math.floor(
            (new Date().getTime() - teacher.joiningDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
          )
        : null,
    };
  }

  /**
   * Transform teacher for admin view (with additional fields)
   */
  static toAdmin(teacher: TeacherWithRelations) {
    return {
      ...this.toDetail(teacher),
      userId: teacher.userId,
      // Add admin-specific fields here
      statusLabel: teacher.status ? 'Active' : 'Inactive',
    };
  }
}

export default TeacherDTO;
