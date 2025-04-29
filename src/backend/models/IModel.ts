'use server';

import { Prisma } from '@prisma/client';

/**
 * Interface for model operations
 */
export interface IModel<T> {
  create(data: any): Promise<T>;
  createMany(data: any[]): Promise<Prisma.BatchPayload>;
  update(id: string | number, data: any): Promise<T>;
  delete(id: string | number): Promise<T>;
  findMany(filters?: any): Promise<T[]>;
  findUnique(id: string | number): Promise<T | null>;
  findFirst(filters?: any): Promise<T | null>;
  upsert(id: string | number, create: any, update: any): Promise<T>;
  aggregate(params: any): Promise<any>;
  queryRaw<R = any>(query: string, ...values: any[]): Promise<R>;
  softDelete(id: string | number): Promise<T>;
  count(filters?: any): Promise<number>;
}
