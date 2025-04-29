'use server';

import { Prisma } from '@prisma/client';

export interface IService<T, CreateInput, UpdateInput, DTO = any> {
  findById(id: string | number, transformMethod?: keyof DTO): Promise<T | null>;
  findAll(filters?: any, transformMethod?: keyof DTO): Promise<T[]>;
  findAllPaginated(
    page: number,
    perPage: number,
    filters?: any,
    transformMethod?: keyof DTO
  ): Promise<{ data: T[]; total: number; page: number; perPage: number; pageCount: number }>;

  count(filters?: any): Promise<number>;
  create(data: CreateInput): Promise<T>;
  createMany(data: CreateInput[]): Promise<Prisma.BatchPayload>;
  update(id: string | number, data: UpdateInput): Promise<T>;
  delete(id: string | number): Promise<T>;
  upsert(id: string | number, create: CreateInput, update: UpdateInput): Promise<T>;
  findOne(filters: any, transformMethod?: keyof DTO): Promise<T | null>;
  softDelete(id: string | number): Promise<T>; // Optional method for soft delete if needed
  aggregate<R = any>(params: any): Promise<R>;
  executeRawQuery<R = any>(query: string, ...values: any[]): Promise<R>;
}
