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

  async create(data: CreateInput): Promise<T> {
    return await this.model.create(data);
  }

  async update(id: number | string, data: UpdateInput): Promise<T> {
    return await this.model.update(id, data);
  }

  async delete(id: number | string): Promise<T> {
    return await this.model.delete(id);
  }
}

export default BaseService;
