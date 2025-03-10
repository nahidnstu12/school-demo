'use server';

export interface IService<T, CreateInput, UpdateInput, DTO = any> {
  findById(id: string | number, transformMethod?: keyof DTO): Promise<T | null>;
  findAll(filters?: any, transformMethod?: keyof DTO): Promise<T[]>;
  create(data: CreateInput): Promise<T>;
  update(id: string | number, data: UpdateInput): Promise<T>;
  delete(id: string | number): Promise<T>;
}
