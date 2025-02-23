import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { PaginatedResponse, SearchParams } from '@/types/common';

export abstract class BaseRepository<T> {
  protected prisma: PrismaClient;
  protected model: any;

  constructor(model: keyof PrismaClient) {
    this.prisma = prisma;
    this.model = this.prisma[model];
  }

  async findAll(params: SearchParams): Promise<PaginatedResponse<T>> {
    const { page = 1, limit = 10, orderBy = { createdAt: 'desc' }, filters = {} } = params;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.findMany({
        skip,
        take: limit,
        where: filters,
        orderBy,
      }),
      this.model.count({ where: filters }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({
      where: { id },
    });
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create({ data });
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return this.model.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({
      where: { id },
    });
  }
}
