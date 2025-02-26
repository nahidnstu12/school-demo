import type { BaseRepository } from '@/repositories/base.repository';
import type { PaginatedResponse, SearchParams } from '@/types/common';

export abstract class BaseService<T> {
  protected repository: BaseRepository<T>;

  constructor(repository: BaseRepository<T>) {
    this.repository = repository;
  }

  async findAll(params: SearchParams): Promise<PaginatedResponse<T>> {
    return this.repository.findAll(params);
  }

  async findById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }

  async create(data: Partial<T>): Promise<T> {
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<T> {
    return this.repository.delete(id);
  }
}
