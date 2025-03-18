import { PrismaClient, UserRole, NoticeType } from '@prisma/client';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Utility to create a date within a range
const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Utility to get random item from array
const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Utility to get random items from array
const getRandomItems = <T>(array: T[], min: number, max: number): T[] => {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

async function main() {
  console.log('Starting seeding...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.$transaction([
    prisma.notice.deleteMany(),
    prisma.examResult.deleteMany(),
    prisma.assignmentSubmission.deleteMany(),
    prisma.assignment.deleteMany(),
    prisma.attendance.deleteMany(),
    prisma.routineSlot.deleteMany(),
    prisma.routine.deleteMany(),
    prisma.subjectTeacher.deleteMany(),
    prisma.teacherAssign.deleteMany(),
    prisma.subject.deleteMany(),
    prisma.student.deleteMany(),
    prisma.section.deleteMany(),
    prisma.group.deleteMany(),
    prisma.shift.deleteMany(),
    prisma.level.deleteMany(),
    prisma.teacher.deleteMany(),
    prisma.staff.deleteMany(),
    prisma.institution.deleteMany(),
    prisma.user.deleteMany(),
    prisma.image.deleteMany(),
  ]);
  console.log('Existing data cleared.');

  // Create Images for profile pictures and institution logos
  console.log('Creating sample images...');
  const images = await Promise.all(
    Array.from({ length: 5 }).map(async (_, index) => {
      return prisma.image.create({
        data: {
          path: `/uploads/images/image${index + 1}.jpg`,
          filename: `image${index + 1}.jpg`,
          mimetype: 'image/jpeg',
          size: Math.floor(Math.random() * 1000000) + 100000,
        },
      });
    })
  );
  console.log('Sample images created:', images.length);

  // Create Admin User
  console.log('Creating admin user...');
  const adminUser = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: await hash('password123', 12),
      role: UserRole.ADMIN,
      phone: '+1234567890',
      status: true,
    },
  });
  console.log('Admin user created:', adminUser.email);

  // Create Institutions
  console.log('Creating institutions...');
  const institutions = await Promise.all(
    Array.from({ length: 2 }).map(async (_, index) => {
      return prisma.institution.create({
        data: {
          userId: adminUser.id,
          uuid: uuidv4(),
          name: `Institution ${index + 1}`,
          location: `Address ${index + 1}`,
          contactNumber: `+1234567890${index}`,
          address: `Street ${index + 1}, City`,
          type: 'PRIMARY_SCHOOL',
          logo: images[0].id,
          coverPhoto: images[1].id,
          status: true,
          extraInfos: { details: "Additional information" },
        },
      });
    })
  );
  console.log('Institutions created:', institutions.length);

  for (const institution of institutions) {
    console.log(`Seeding data for Institution: ${institution.name}`);

    // Create Teachers
    console.log('Creating teachers...');
    const teachers = await Promise.all(
      Array.from({ length: 3 }).map(async (_, index) => {
        const user = await prisma.user.create({
          data: {
            firstName: `Teacher`,
            lastName: `${index + 1}`,
            email: `teacher${index + 1}_-S${Math.random()}${institution.id.substring(0, 5)}@example.com`,
            password: await hash('password123', 12),
            role: UserRole.TEACHER,
            phone: `+1987654321${index}`,
            status: true,
          },
        });

        return prisma.teacher.create({
          data: {
            userId: user.id,
            institutionId: institution.id,
            designation: `Senior Teacher`,
            specialization: `Subject ${index + 1}`,
            joiningDate: randomDate(new Date('2020-01-01'), new Date()),
            address: `Teacher Address ${index + 1}`,
            district: `District ${index % 3 + 1}`,
            status: true,
          },
        });
      })
    );
    console.log('Teachers created:', teachers.length);

    // Create Levels
    console.log('Creating levels...');
    const levels = await Promise.all(
      Array.from({ length: 3 }).map(async (_, index) => {
        const level = await prisma.level.create({
          data: {
            institutionId: institution.id,
            name: `Level ${index + 1}`,
            hasShift: index % 2 === 0,
            hasGroup: index % 2 === 0,
            hasSection: true,
            status: true,
          },
        });

        console.log(`Level created: ${level.name}`);
        return level;
      })
    );
    console.log('Levels created:', levels.length);

    // Create Shifts for each Level where hasShift is true
    console.log('Creating shifts...');
    const shifts = await Promise.all(
      levels.filter(level => level.hasShift).flatMap(level => 
        ['Morning', 'Evening'].map(shiftName => 
          prisma.shift.create({
            data: {
              levelId: level.id,
              name: shiftName,
              status: true,
            },
          })
        )
      )
    );
    console.log('Shifts created:', shifts.length);

    // Create Groups for each Level where hasGroup is true
    console.log('Creating groups...');
    const groups = await Promise.all(
      levels.filter(level => level.hasGroup).flatMap(level => 
        ['Science', 'Commerce', 'Arts'].map(groupName => 
          prisma.group.create({
            data: {
              levelId: level.id,
              name: groupName,
              status: true,
            },
          })
        )
      )
    );
    console.log('Groups created:', groups.length);

    // Create Sections for each Level where hasSection is true
    console.log('Creating sections...');
    const sections = await Promise.all(
      levels.filter(level => level.hasSection).flatMap(level => 
        ['A', 'B', 'C'].map(sectionName => 
          prisma.section.create({
            data: {
              levelId: level.id,
              name: sectionName,
              groupId: level.hasGroup ? getRandomItem(groups.filter(g => g.levelId === level.id))?.id : null,
              status: true,
            },
          })
        )
      )
    );
    console.log('Sections created:', sections.length);

    // Create Subjects for each Level with truly unique codes
    console.log('Creating subjects...');
    const subjects = await Promise.all(
      levels.flatMap((level, levelIndex) =>
        Array.from({ length: 4 }).map((_, index) => {
          // Create a truly unique code using institution ID, level index, and subject index
          const uniqueCode = `SUB-${institution.id.substring(0, 3)}-L${levelIndex + 1}-S${index + 1}`;
          
          return prisma.subject.create({
            data: {
              institutionId: institution.id,
              levelId: level.id,
              name: `Subject ${index + 1} for ${level.name}`,
              code: uniqueCode,
              creditHours: Math.floor(Math.random() * 2) + 2,
              description: `Description for Subject ${index + 1}`,
              status: true,
            },
          });
        })
      )
    );
    console.log('Subjects created:', subjects.length);

    // Assign Teachers to Subjects (SubjectTeacher)
    console.log('Assigning teachers to subjects (SubjectTeacher)...');
    const subjectTeachers = await Promise.all(
      subjects.map((subject) =>
        getRandomItems(teachers, 1, 2).map((teacher) =>
          prisma.subjectTeacher.create({
            data: {
              subjectId: subject.id,
              teacherId: teacher.id,
            },
          })
        )
      ).flat()
    );
    console.log('SubjectTeacher relationships created:', subjectTeachers.length);

    // Create TeacherAssigns
    console.log('Creating teacher assignments...');
    const teacherAssigns = await Promise.all(
      levels.flatMap((level) => {
        const levelSections = sections.filter(section => section.levelId === level.id);
        const levelSubjects = subjects.filter(subject => subject.levelId === level.id);
        
        return levelSections.flatMap(section => 
          levelSubjects.map(subject => {
            const availableTeachers = subjectTeachers
              .filter(st => st.subjectId === subject.id)
              .map(st => st.teacherId);
            
            if (availableTeachers.length === 0) return null;
            
            return prisma.teacherAssign.create({
              data: {
                teacherId: getRandomItem(availableTeachers),
                levelId: level.id,
                sectionId: section.id,
                subjectId: subject.id,
              }
            });
          }).filter(Boolean)
        );
      })
    );
    console.log('Teacher assignments created:', teacherAssigns.length);

    // Create Students
    console.log('Creating students...');
    const students = await Promise.all(
      levels.flatMap((level) => {
        const levelSections = sections.filter(section => section.levelId === level.id);
        const levelGroups = groups.filter(group => group.levelId === level.id);
        
        return Array.from({ length: 5 }).map(async (_, index) => {
          const user = await prisma.user.create({
            data: {
              firstName: `Student`,
              lastName: `${index + 1}`,
              email: `student${index + 1}_${level.id.substring(0, 5)}-S${Math.random()}@example.com`,
              password: await hash('password123', 12),
              role: UserRole.STUDENT,
              phone: `+1555${String(index).padStart(4, '0')}`,
              status: true,
            },
          });

          return prisma.student.create({
            data: {
              userId: user.id,
              institutionId: institution.id,
              levelId: level.id,
              sectionId: levelSections.length > 0 ? getRandomItem(levelSections).id : null,
              groupId: levelGroups.length > 0 ? getRandomItem(levelGroups).id : null,
              rollNo: `${level.id.substring(0, 3)}-S${Math.random()}${String(index + 1).padStart(3, '0')}`,
              address: `Student Address ${index + 1}`,
              joiningDate: randomDate(new Date('2020-01-01'), new Date()),
              status: true,
              extraInfos: { 
                parentName: `Parent ${index + 1}`,
                parentContact: `+1999${String(index).padStart(4, '0')}`,
              },
            },
          });
        });
      })
    );
    console.log('Students created:', students.length);

    // Create Staff
    console.log('Creating staff...');
    const staffMembers = await Promise.all(
      Array.from({ length: 3 }).map(async (_, index) => {
        const user = await prisma.user.create({
          data: {
            firstName: `Staff`,
            lastName: `${index + 1}`,
            email: `staff${index + 1}_${institution.id.substring(0, 5)}-S${Math.random()}@example.com`,
            password: await hash('password123', 12),
            role: UserRole.STAFF,
            phone: `+1444${String(index).padStart(4, '0')}`,
            status: true,
          },
        });

        return prisma.staff.create({
          data: {
            userId: user.id,
            institutionId: institution.id,
            designation: `Designation ${index + 1}`,
            joiningDate: randomDate(new Date('2020-01-01'), new Date()),
            status: true,
          },
        });
      })
    );
    console.log('Staff created:', staffMembers.length);

    // Create Routines for each Level
    console.log('Creating routines...');
    const routines = await Promise.all(
      levels.map((level) =>
        prisma.routine.create({
          data: {
            levelId: level.id,
            semester: '2024-1',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-06-30'),
          },
        })
      )
    );
    console.log('Routines created:', routines.length);

    // Create Routine Slots
    console.log('Creating routine slots...');
    const routineSlots = await Promise.all(
      routines.flatMap((routine) => {
        const levelSubjects = subjects.filter(subject => subject.levelId === routine.levelId);
        
        return Array.from({ length: 5 }).flatMap((_, dayIndex) =>
          levelSubjects.slice(0, 3).map((subject, slotIndex) => {
            // Find teachers assigned to this subject
            const teachersForSubject = subjectTeachers
              .filter(st => st.subjectId === subject.id)
              .map(st => st.teacherId);
            
            if (teachersForSubject.length === 0) return null;
            
            return prisma.routineSlot.create({
              data: {
                routineId: routine.id,
                subjectId: subject.id,
                teacherId: getRandomItem(teachersForSubject),
                dayOfWeek: dayIndex + 1,
                startTime: new Date(`2024-01-01T08:${String((slotIndex * 2) % 12).padStart(2, '0')}:00`),
                endTime: new Date(`2024-01-01T09:${String((slotIndex * 2) % 12).padStart(2, '0')}:00`),
              },
            });
          }).filter(Boolean)
        );
      })
    );
    console.log('Routine slots created:', routineSlots.length);

    // Create Assignments
    console.log('Creating assignments...');
    const assignments = await Promise.all(
      subjects.map((subject) =>
        Array.from({ length: 2 }).map((_, index) =>
          prisma.assignment.create({
            data: {
              subjectId: subject.id,
              title: `Assignment ${index + 1} for ${subject.name}`,
              description: `Complete the following tasks for ${subject.name}...`,
              dueDate: randomDate(new Date('2024-01-15'), new Date('2024-05-30')),
              totalMarks: 20 + (index * 10),
            },
          })
        )
      ).flat()
    );
    console.log('Assignments created:', assignments.length);

    // Create Assignment Submissions
    console.log('Creating assignment submissions...');
    const assignmentSubmissions = await Promise.all(
      assignments.flatMap((assignment) => {
        const subject = subjects.find(s => s.id === assignment.subjectId);
        if (!subject) return [];
        
        const studentsInLevel = students.filter(s => s.levelId === subject.levelId);
        
        return getRandomItems(studentsInLevel, 1, 3).map(student =>
          prisma.assignmentSubmission.create({
            data: {
              assignmentId: assignment.id,
              studentId: student.id,
              submissionUrl: `https://example.com/submissions/${assignment.id}_${student.id}.pdf`,
              marks: Math.random() < 0.7 ? Math.floor(Math.random() * assignment.totalMarks) : null,
              submittedAt: randomDate(new Date(assignment.createdAt), new Date(assignment.dueDate)),
            },
          })
        );
      })
    );
    console.log('Assignment submissions created:', assignmentSubmissions.length);

    // Create Attendance Records
    console.log('Creating attendance records...');
    const attendanceRecords = await Promise.all(
      subjects.flatMap((subject) => {
        const studentsInLevel = students.filter(s => s.levelId === subject.levelId);
        
        return Array.from({ length: 5 }).flatMap((_, dayIndex) => {
          const date = new Date();
          date.setDate(date.getDate() - (dayIndex * 7));
          
          return studentsInLevel.map(student =>
            prisma.attendance.create({
              data: {
                subjectId: subject.id,
                studentId: student.id,
                date: date,
                isPresent: Math.random() > 0.2, // 80% attendance rate
              },
            })
          );
        });
      })
    );
    console.log('Attendance records created:', attendanceRecords.length);

    // Create Exam Results
    console.log('Creating exam results...');
    const examResults = await Promise.all(
      subjects.flatMap((subject) => {
        const studentsInLevel = students.filter(s => s.levelId === subject.levelId);
        
        return ['Midterm', 'Final'].flatMap(examType =>
          studentsInLevel.map(student => {
            const marks = Math.floor(Math.random() * 60) + 40; // 40-100 marks
            let grade = 'F';
            if (marks >= 90) grade = 'A+';
            else if (marks >= 80) grade = 'A';
            else if (marks >= 70) grade = 'B';
            else if (marks >= 60) grade = 'C';
            else if (marks >= 50) grade = 'D';
            
            return prisma.examResult.create({
              data: {
                subjectId: subject.id,
                studentId: student.id,
                examType,
                marks,
                grade,
              },
            });
          })
        );
      })
    );
    console.log('Exam results created:', examResults.length);

    // Create Notices
    console.log('Creating notices...');
    const notices = await Promise.all([
      // Global notices for institution
      ...Array.from({ length: 3 }).map((_, index) =>
        prisma.notice.create({
          data: {
            institutionId: institution.id,
            createdBy: adminUser.id,
            title: `Important Announcement ${index + 1}`,
            body: `This is an important announcement for all students and teachers.`,
            type: NoticeType.GLOBAL,
            isPinned: index === 0,
            publishedAt: randomDate(new Date('2024-01-01'), new Date()),
          },
        })
      ),
      
      // Teacher notices
      ...teachers.flatMap((teacher) =>
        Array.from({ length: 2 }).map((_, index) =>
          prisma.notice.create({
            data: {
              institutionId: institution.id,
              createdBy: teacher.userId,
              teacherId: teacher.id,
              title: `Notice from ${teacher.id.substring(0, 5)} - ${index + 1}`,
              body: `This is a notice from the teacher for students.`,
              type: NoticeType.TEACHER,
              levelId: getRandomItem(levels).id,
              publishedAt: randomDate(new Date('2024-02-01'), new Date()),
            },
          })
        )
      ),
    ]);
    console.log('Notices created:', notices.length);

    console.log('Seeding completed for Institution:', institution.name);
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });