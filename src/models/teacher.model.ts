'use server';

import { prisma } from '@/lib/prisma';
import BaseModel from './base.model';
import { Teacher, Prisma } from '@prisma/client';

class TeacherModel extends BaseModel<Teacher> {
  constructor() {
    super(prisma.teacher);
  }

  // Override findMany to include user and institution relations
  async findMany(args?: Prisma.TeacherFindManyArgs): Promise<Teacher[]> {
    return this.model.findMany({
      ...args,
      include: {
        user: true,
        institution: true,
      },
    });
  }

  // Override findFirst to include user and institution relations
  async findFirst(args?: Prisma.TeacherFindFirstArgs): Promise<Teacher | null> {
    return this.model.findFirst({
      ...args,
      include: {
        user: true,
        institution: true,
      },
    });
  }

  // Add a custom method for paginated results including relations
  async findManyPaginated(
    page: number = 1,
    pageSize: number = 10,
    args?: Prisma.TeacherFindManyArgs
  ): Promise<{ data: Teacher[]; total: number }> {
    // Ensure args exists
    const queryArgs = args || {};

    // Add pagination
    queryArgs.skip = (page - 1) * pageSize;
    queryArgs.take = pageSize;

    // Include relations
    queryArgs.include = {
      user: true,
      institution: true,
    };

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      this.model.findMany(queryArgs),
      this.model.count({ where: queryArgs.where }),
    ]);

    return { data, total };
  }
}

export default TeacherModel;
