import { PrismaClient, UserRole, NoticeType } from '@prisma/client';
import { hash } from 'bcryptjs';

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
    prisma.subject.deleteMany(),
    prisma.section.deleteMany(),
    prisma.group.deleteMany(),
    prisma.shift.deleteMany(),
    prisma.student.deleteMany(),
    prisma.teacher.deleteMany(),
    prisma.staff.deleteMany(),
    prisma.level.deleteMany(),
    prisma.user.deleteMany(),
    prisma.institution.deleteMany(),
  ]);
  console.log('Existing data cleared.');

  // Create Institutions
  console.log('Creating institutions...');
  const institutions = await Promise.all(
    Array.from({ length: 2 }).map(async (_, index) => {
      return prisma.institution.create({
        data: {
          name: `Institution ${index + 1}`,
          address: `Address ${index + 1}`,
          contactNumber: `+1234567890${index}`,
          email: `institution${index + 1}@example.com`,
        },
      });
    })
  );
  console.log('Institutions created:', institutions);

  for (const institution of institutions) {
    console.log(`Seeding data for Institution: ${institution.name}`);

    // Create Teachers
    console.log('Creating teachers...');
    const teachers = await Promise.all(
      Array.from({ length: 3 }).map(async (_, index) => {
        const user = await prisma.user.create({
          data: {
            email: `teacher${index + 1}_${institution.id}@example.com`,
            password: await hash('password123', 12),
            role: UserRole.TEACHER,
          },
        });

        return prisma.teacher.create({
          data: {
            userId: user.id,
            institutionId: institution.id,
            name: `Teacher ${index + 1}`,
            specialization: `Subject ${index + 1}`,
            joiningDate: randomDate(new Date('2020-01-01'), new Date()),
          },
        });
      })
    );
    console.log('Teachers created:', teachers);

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
            hasSection: index % 2 === 0,
          },
        });

        console.log(`Level created: ${level.name}`);

        // Create Shifts, Groups, and Sections if enabled
        if (level.hasShift) {
          console.log('Creating shifts...');
          await Promise.all(
            ['Morning', 'Evening'].map((shiftName) =>
              prisma.shift.create({
                data: {
                  levelId: level.id,
                  name: shiftName,
                },
              })
            )
          );
          console.log('Shifts created for level:', level.name);
        }

        if (level.hasGroup) {
          console.log('Creating groups...');
          await Promise.all(
            ['Science', 'Commerce'].map((groupName) =>
              prisma.group.create({
                data: {
                  levelId: level.id,
                  name: groupName,
                },
              })
            )
          );
          console.log('Groups created for level:', level.name);
        }

        if (level.hasSection) {
          console.log('Creating sections...');
          await Promise.all(
            ['A', 'B', 'C'].map((sectionName) =>
              prisma.section.create({
                data: {
                  levelId: level.id,
                  name: sectionName,
                },
              })
            )
          );
          console.log('Sections created for level:', level.name);
        }

        return level;
      })
    );
    console.log('Levels created:', levels);

    // Create Subjects for each Level
    console.log('Creating subjects...');
    const subjects = await Promise.all(
      levels.flatMap((level) =>
        Array.from({ length: 4 }).map((_, index) =>
          prisma.subject.create({
            data: {
              institutionId: institution.id,
              levelId: level.id,
              name: `Subject ${index + 1}`,
              code: `SUB${level.id}${index + 1}`,
              creditHours: Math.floor(Math.random() * 2) + 2,
            },
          })
        )
      )
    );
    console.log('Subjects created:', subjects);

    // Assign Teachers to Subjects
    console.log('Assigning teachers to subjects...');
    await Promise.all(
      subjects.map((subject) =>
        Promise.all(
          getRandomItems(teachers, 1, 3).map((teacher) =>
            prisma.subjectTeacher.create({
              data: {
                subjectId: subject.id,
                teacherId: teacher.id,
              },
            })
          )
        )
      )
    );
    console.log('Teachers assigned to subjects.');

    // Create Students
    console.log('Creating students...');
    const students = await Promise.all(
      levels.flatMap((level) =>
        Array.from({ length: 5 }).map(async (_, index) => {
          const user = await prisma.user.create({
            data: {
              email: `student${index + 1}_${level.id}@example.com`,
              password: await hash('password123', 12),
              role: UserRole.STUDENT,
            },
          });

          return prisma.student.create({
            data: {
              userId: user.id,
              institutionId: institution.id,
              levelId: level.id,
              name: `Student ${index + 1}`,
              rollNumber: `${level.id}${String(index + 1).padStart(3, '0')}`,
              joiningDate: randomDate(new Date('2020-01-01'), new Date()),
            },
          });
        })
      )
    );
    console.log('Students created:', students);

    // Create Staff
    console.log('Creating staff...');
    await Promise.all(
      Array.from({ length: 3 }).map(async (_, index) => {
        const user = await prisma.user.create({
          data: {
            email: `staff${index + 1}_${institution.id}@example.com`,
            password: await hash('password123', 12),
            role: UserRole.STAFF,
          },
        });

        return prisma.staff.create({
          data: {
            userId: user.id,
            institutionId: institution.id,
            name: `Staff ${index + 1}`,
            designation: `Designation ${index + 1}`,
            joiningDate: randomDate(new Date('2020-01-01'), new Date()),
          },
        });
      })
    );
    console.log('Staff created.');

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
    console.log('Routines created:', routines);

    // Create Routine Slots
    console.log('Creating routine slots...');
    await Promise.all(
      routines.flatMap((routine) =>
        Array.from({ length: 5 }).flatMap((_, dayIndex) =>
          subjects
            .filter((subject) => subject.levelId === routine.levelId)
            .map((subject) => {
              const teacher = getRandomItem(teachers);
              return prisma.routineSlot.create({
                data: {
                  routineId: routine.id,
                  subjectId: subject.id,
                  teacherId: teacher.id,
                  dayOfWeek: dayIndex + 1,
                  startTime: new Date(`2024-01-01T09:${String(dayIndex * 2).padStart(2, '0')}:00`),
                  endTime: new Date(`2024-01-01T10:${String(dayIndex * 2).padStart(2, '0')}:00`),
                },
              });
            })
        )
      )
    );
    console.log('Routine slots created.');

    // Further seeding for assignments, exam results, notices, etc...
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
