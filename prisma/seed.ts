import { PrismaClient, UserRole, NoticeType } from '@prisma/client';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { mockproducts, mockTeachers } from './fakerData';

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
          ownerId: "",
          ownerType: "Product"
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

  // Create 10 Institutions
  console.log('Creating 10 institutions...');
  const institutions = await Promise.all(
    Array.from({ length: 10 }).map(async (_, index) => {
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

  // Process each institution
  for (let instIndex = 0; instIndex < institutions.length; instIndex++) {
    const institution = institutions[instIndex];
    console.log(`Seeding data for Institution: ${institution.name}`);

    // Calculate the slice of teachers for this institution (50 per institution)
    const startIndex = instIndex * 10;
    const endIndex = startIndex + 10;
    const institutionTeachers = mockTeachers.slice(startIndex, endIndex);

    // Create Teachers using the mock data
    console.log('Creating teachers...');
    const teachers = await Promise.all(
      institutionTeachers.map(async (teacherData) => {
        const user = await prisma.user.create({
          data: {
            firstName: teacherData.firstName,
            lastName: teacherData.lastName,
            email: teacherData.email,
            password: await hash('password123', 12),
            role: UserRole.TEACHER,
            phone: teacherData.phone,
            status: true,
          },
        });

        return prisma.teacher.create({
          data: {
            userId: user.id,
            institutionId: institution.id,
            designation: teacherData.designation,
            specialization: teacherData.specialization,
            joiningDate: new Date(teacherData.joiningDate),
            address: teacherData.address,
            district: teacherData.district,
            status: teacherData.status,
            // extraInfos: {
            //   education: teacherData.education,
            //   certifications: teacherData.certifications,
            //   yearsOfExperience: teacherData.yearsOfExperience
            // }
          },
        });
      })
    );
    console.log('Teachers created:', teachers.length);

    // Create 5 Levels per institution
    console.log('Creating 5 levels...');
    const levels = await Promise.all(
      Array.from({ length: 5 }).map(async (_, index) => {
        const level = await prisma.level.create({
          data: {
            institutionId: institution.id,
            name: `Level ${index + 1}`,
            hasShift: index % 2 === 0,
            hasGroup: true, // All levels have groups
            hasSection: true,
            status: true,
          },
        });

        console.log(`Level created: ${level.name}`);
        return level;
      })
    );
    console.log('Levels created:', levels.length);

    // Create 2 Groups for each Level
    console.log('Creating 2 groups per level...');
    const groups = await Promise.all(
      levels.flatMap(level => 
        ['Science', 'Arts'].map(groupName => 
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

    // Create Sections for each Level
    console.log('Creating sections...');
    const sections = await Promise.all(
      levels.flatMap(level => 
        ['A', 'B'].map(sectionName => 
          prisma.section.create({
            data: {
              levelId: level.id,
              name: sectionName,
              groupId: getRandomItem(groups.filter(g => g.levelId === level.id))?.id,
              status: true,
            },
          })
        )
      )
    );
    console.log('Sections created:', sections.length);

    // Create Subjects for each Level
    console.log('Creating subjects...');
    const subjects = await Promise.all(
      levels.flatMap((level, levelIndex) =>
        Array.from({ length: 6 }).map((_, index) => {
          // Create a unique code using institution ID, level index, and subject index
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
        getRandomItems(teachers, 1, 3).map((teacher) =>
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

    // Create 10 Students per institution
    console.log('Creating 10 students...');
    const students = await Promise.all(
      Array.from({ length: 10 }).map(async (_, index) => {
        const level = getRandomItem(levels);
        const levelSections = sections.filter(section => section.levelId === level.id);
        const levelGroups = groups.filter(group => group.levelId === level.id);
        
        const user = await prisma.user.create({
          data: {
            firstName: `Student`,
            lastName: `${index + 1}-Inst${instIndex + 1}`,
            email: `student${index + 1}_inst${instIndex + 1}@example.com`,
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
            rollNo: `${level.id.substring(0, 3)}-S${index + 1}`,
            address: `Student Address ${index + 1}, Institution ${instIndex + 1}`,
            joiningDate: randomDate(new Date('2020-01-01'), new Date()),
            status: true,
            extraInfos: { 
              parentName: `Parent ${index + 1}`,
              parentContact: `+1999${String(index).padStart(4, '0')}`,
            },
          },
        });
      })
    );
    console.log('Students created:', students.length);

    // Create basic assignments, attendance records, and exam results
    // We'll keep this minimal since we're focusing on teachers
    console.log('Creating basic assignments and exam records...');
    await Promise.all(
      subjects.slice(0, 3).flatMap((subject) => {
        return prisma.assignment.create({
          data: {
            subjectId: subject.id,
            title: `Assignment for ${subject.name}`,
            description: `Complete the following tasks...`,
            dueDate: randomDate(new Date('2024-01-15'), new Date('2024-05-30')),
            totalMarks: 50,
          },
        });
      })
    );

    console.log('Institution seeding completed:', institution.name);
  }

  // Keep the rest of your seeding logic for products
  console.log('Creating categories...');
  const categoriesData = [
    { id: uuidv4(), name: 'Electronics' },
    { id: uuidv4(), name: 'Books' },
    { id: uuidv4(), name: 'Clothing' },
    { id: uuidv4(), name: 'Home & Kitchen' },
    { id: uuidv4(), name: 'Sports & Outdoors' },
    { id: uuidv4(), name: 'Beauty & Personal Care' },
    { id: uuidv4(), name: 'Toys & Games' },
    { id: uuidv4(), name: 'Health & Wellness' }
  ];

  // Insert categories with predefined IDs
  for (const category of categoriesData) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: {
        id: category.id,
        name: category.name
      }
    });
  }
  console.log(`Categories created: ${categoriesData.length}`);

  // Create a category mapping using the predefined IDs
  const categoryMap = categoriesData.reduce((map, category) => {
    map[category.name] = category.id;
    return map;
  }, {} as Record<string, string>);

  // Create products
  for (const product of mockproducts) {
    const categoryId = categoryMap[product.category];

    if (!categoryId) {
      console.warn(`Category not found: ${product.category}`);
      continue;
    }

    // Create product
    const createdProduct = await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: {
        id: uuidv4(),
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        categoryId: categoryId,
        stock: product.stock,
        sku: product.sku,
        featured: product.featured,
        tags: product.tags,
        deleted: false
      }
    });

    // Create images for the product
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        await prisma.image.create({
          data: {
            id: uuidv4(),
            path: `/images/products/${image.filename}`,
            filename: image.filename,
            mimetype: image.mimetype,
            size: image.size,
            ownerId: createdProduct.id,
            ownerType: 'Product'
          }
        });
      }
    }
  }

  console.log('Products and images seeded');
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