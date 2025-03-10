'use server';

/**
 * Interface for model operations
 */
export interface IModel<T> {
  create(data: any): Promise<T>;
  update(id: string | number, data: any): Promise<T>;
  delete(id: string | number): Promise<T>;
  findMany(filters?: any): Promise<T[]>;
  findUnique(id: string | number): Promise<T | null>;
}
