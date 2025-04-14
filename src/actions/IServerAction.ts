'use server';

import { Prisma } from '@prisma/client';

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; errors: { field: string | number; message: string }[] };

export interface IServerAction<T, ModelType> {
  create(formData: FormData): Promise<{ success: boolean; data?: ModelType; errors?: any[] }>;
  createMany(formData: FormData): Promise<ActionResult<Prisma.BatchPayload>>;
  update(
    id: string | number,
    formData: FormData
  ): Promise<{ success: boolean; data?: ModelType; errors?: any[] }>;
  delete(id: string | number): Promise<{ success: boolean; data?: ModelType; errors?: any[] }>;
  getById(
    id: string | number
  ): Promise<{ success: boolean; data?: ModelType | null; errors?: any[] }>;
  getAll(filters?: any): Promise<{ success: boolean; data?: ModelType[]; errors?: any[] }>;
  upsert(id: string | number, formData: FormData): Promise<ActionResult<ModelType>>;
  findOne(filters: any): Promise<ActionResult<ModelType | null>>;
  softDelete(id: string | number): Promise<ActionResult<ModelType>>;

  // getAllPaginated(
  //   page?: number,
  //   perPage?: number,
  //   filters?: any
  // ): Promise<
  //   ActionResult<{
  //     data: ModelType[];
  //     total: number;
  //     page: number;
  //     perPage: number;
  //     pageCount: number;
  //   }>
  // >;
  count(filters?: any): Promise<ActionResult<number>>;
  aggregate(params: any): Promise<ActionResult<any>>;
  executeRawQuery(formData: FormData): Promise<ActionResult<any>>;
}
