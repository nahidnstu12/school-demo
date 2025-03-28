'use server';

import { IModel } from '@/models/IModel';
import { IService } from './IService';
import { Prisma } from '@prisma/client';

abstract class BaseService<T, CreateInput, UpdateInput, M extends IModel<T>, DTO = null>
  implements IService<T, CreateInput, UpdateInput>
{
  protected model: M;
  protected DTOClass?: DTO;

  constructor(model: M, DTOClass?: DTO) {
    this.model = model;
    this.DTOClass = DTOClass;
  }

  // Method to transform data using DTO
  protected transformData(data: any, method: keyof DTO): any {
    if (!this.DTOClass || typeof this.DTOClass[method] !== 'function' || !data) return data;

    return Array.isArray(data)
      ? data.map((item) => (this.DTOClass as any)[method](item))
      : (this.DTOClass as any)[method](data);
  }

  async findById(
    id: number | string,
    transformMethod: keyof DTO = 'toProfile' as keyof DTO
  ): Promise<T | null> {
    const data = await this.model.findUnique(id);
    return this.transformData(data, transformMethod);
  }

  async findAll(
    filters?: Prisma.Args<any, 'findMany'>,
    transformMethod: keyof DTO = 'toList' as keyof DTO
  ): Promise<T[]> {
    const data = await this.model.findMany(filters);
    return this.transformData(data, transformMethod);
  }

  async findAllPaginated(
    page: number = 1,
    perPage: number = 10,
    filters: Prisma.Args<any, 'findMany'> = {},
    transformMethod: keyof DTO = 'toList' as keyof DTO
  ): Promise<{ data: T[]; total: number; page: number; perPage: number; pageCount: number }> {
    // Calculate skip value based on page number and items per page
    const skip = (page - 1) * perPage;

    // Add pagination to filters
    const paginatedFilters = {
      ...filters,
      skip,
      take: perPage,
    };

    // Fetch data with pagination
    const data = await this.model.findMany(paginatedFilters);

    // Get total count for pagination metadata
    const total = await this.model.count(filters);

    // Calculate total pages
    const pageCount = Math.ceil(total / perPage);

    // Transform data if needed
    const transformedData = this.transformData(data, transformMethod);

    console.log('base service>', data.length, total);
    // Return data with pagination metadata
    return {
      data: transformedData,
      total,
      page,
      perPage,
      pageCount,
    };
  }

  async findWithRelations(
    id: string | number,
    relations: string[],
    transformMethod: keyof DTO = 'toProfile' as keyof DTO
  ): Promise<T | null> {
    // Create include object for Prisma based on relations array
    const include = relations.reduce(
      (acc, rel) => {
        acc[rel] = true;
        return acc;
      },
      {} as Record<string, boolean>
    );

    // Find record with relations
    const data = await this.model.findFirst({
      where: { id },
      include,
    });

    return this.transformData(data, transformMethod);
  }

  async count(filters?: Prisma.Args<any, 'count'>): Promise<number> {
    return await this.model.count(filters);
  }

  async create(data: CreateInput): Promise<T> {
    return await this.model.create(data);
  }

  async createMany(data: CreateInput[]): Promise<Prisma.BatchPayload> {
    return await this.model.createMany(data);
  }

  async update(id: number | string, data: UpdateInput): Promise<T> {
    return await this.model.update(id, data);
  }

  async delete(id: number | string): Promise<T> {
    return await this.model.delete(id);
  }

  async findOne(
    filters: Prisma.Args<any, 'findFirst'>,
    transformMethod: keyof DTO = 'toProfile' as keyof DTO
  ): Promise<T | null> {
    const data = await this.model.findFirst(filters);
    return this.transformData(data, transformMethod);
  }

  async upsert(id: number | string, create: CreateInput, update: UpdateInput): Promise<T> {
    return await this.model.upsert(id, create as any, update as any);
  }

  async softDelete(id: number | string): Promise<T> {
    return await this.model.softDelete(id);
  }

  async aggregate<R = any>(params: any): Promise<R> {
    return await this.model.aggregate(params);
  }

  async executeRawQuery<R = any>(query: string, ...values: any[]): Promise<R> {
    return await this.model.queryRaw<R>(query, ...values);
  }
}

export default BaseService;
