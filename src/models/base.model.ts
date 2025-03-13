'use server';

import { Prisma } from '@prisma/client';
import { IModel } from './IModel';

abstract class BaseModel<T> implements IModel<T> {
  protected model: any;
  protected prismaClient: any;

  constructor(model: any, prismaClient?: any) {
    this.model = model;
    this.prismaClient = prismaClient;
  }

  async create(data: Prisma.Args<T, 'create'>['data']) {
    return (this.model as any).create({ data });
  }

  async createMany(data: Prisma.Args<T, 'createMany'>['data']): Promise<Prisma.BatchPayload> {
    return (this.model as any).createMany({ data });
  }

  async update(id: number | string, data: Prisma.Args<T, 'update'>['data']) {
    return await (this.model as any).update({ where: { id }, data });
  }

  async delete(id: string | number) {
    return await (this.model as any).delete({ where: { id } });
  }

  async softDelete(id: string | number): Promise<T> {
    // Default implementation assumes a 'deleted' or 'isDeleted' field
    // This can be overridden in specific model implementations if needed
    return await (this.model as any).update({
      where: { id },
      data: { deleted: true, deletedAt: new Date() } as any,
    });
  }

  async findMany(filters: Prisma.Args<T, 'findMany'> = {} as any): Promise<T[]> {
    // Default implementation with soft delete filtering
    const defaultFilters = { where: { deleted: { not: true } } } as any;
    const mergedFilters = this.mergeFilters(defaultFilters, filters);
    return await (this.model as any).findMany(mergedFilters);
  }

  async findFirst(filters: Prisma.Args<T, 'findFirst'> = {} as any): Promise<T | null> {
    // Default implementation with soft delete filtering
    const defaultFilters = { where: { deleted: { not: true } } } as any;
    const mergedFilters = this.mergeFilters(defaultFilters, filters);
    return await (this.model as any).findFirst(mergedFilters);
  }

  async findUnique(id: string | number): Promise<T | null> {
    return await (this.model as any).findUnique({ where: { id } });
  }

  async upsert(
    id: string | number,
    create: Prisma.Args<T, 'create'>['data'],
    update: Prisma.Args<T, 'update'>['data']
  ): Promise<T> {
    return await (this.model as any).upsert({
      where: { id },
      create,
      update,
    });
  }

  async aggregate(params: Prisma.Args<T, 'aggregate'>): Promise<any> {
    return await (this.model as any).aggregate(params);
  }

  async queryRaw<R = any>(query: string, ...values: any[]): Promise<R> {
    if (!this.prismaClient) {
      throw new Error('Prisma client is not available for raw queries');
    }
    return await this.prismaClient.$queryRaw<R>`${query}${values}`;
  }

  async count(filters: Prisma.Args<T, 'count'> = {} as any): Promise<number> {
    // Default implementation with soft delete filtering
    const defaultFilters = { where: { deleted: { not: true } } } as any;
    const mergedFilters = this.mergeFilters(defaultFilters, filters);
    return await (this.model as any).count(mergedFilters);
  }

  // Utility method to merge filters, considering pagination and relations
  protected mergeFilters(defaultFilters: any, customFilters: any): any {
    // Start with default filters
    const result = { ...defaultFilters };

    // If no custom filters provided, return defaults
    if (!customFilters) return result;

    // Merge 'where' conditions if they exist in both
    if (customFilters.where) {
      result.where = {
        ...result.where,
        ...customFilters.where,
        AND: [...(result.where?.AND || []), ...(customFilters.where?.AND || [])],
        OR: [...(result.where?.OR || []), ...(customFilters.where?.OR || [])],
      };
    }

    // Copy pagination options
    if (customFilters.skip !== undefined) result.skip = customFilters.skip;
    if (customFilters.take !== undefined) result.take = customFilters.take;
    if (customFilters.cursor) result.cursor = customFilters.cursor;

    // Copy ordering options
    if (customFilters.orderBy) result.orderBy = customFilters.orderBy;

    // Copy relation includes
    if (customFilters.include) result.include = customFilters.include;

    // Copy relation selects
    if (customFilters.select) result.select = customFilters.select;

    return result;
  }
}

export default BaseModel;
