'use server';

import { Prisma } from '@prisma/client';
import { IModel } from './IModel';

interface PrismaDelegate<T> {
  create: (args: { data: Prisma.Args<T, 'create'>['data'] }) => Promise<T>;
  update: (args: {
    where: { id: string | number };
    data: Prisma.Args<T, 'update'>['data'];
  }) => Promise<T>;
  delete: (args: { where: { id: string | number } }) => Promise<T>;
  findMany: (args?: Prisma.Args<T, 'findMany'>) => Promise<T[]>;
  findUnique: (args: { where: { id: string | number } }) => Promise<T | null>;
}

abstract class BaseModel<T> implements IModel<T> {
  protected model: PrismaDelegate<T>;

  constructor(model: PrismaDelegate<T>) {
    this.model = model;
  }

  async create(data: Prisma.Args<T, 'create'>['data']) {
    return (this.model as any).create({ data });
  }

  async update(id: number | string, data: Prisma.Args<T, 'update'>['data']) {
    return await (this.model as any).update({ where: { id }, data });
  }

  async delete(id: string | number) {
    return await (this.model as any).delete({ where: { id } });
  }

  async findMany(filters: Prisma.Args<T, 'findMany'> = {} as any) {
    return await (this.model as any).findMany(filters);
  }

  async findUnique(id: string | number): Promise<T | null> {
    return await (this.model as any).findUnique({ where: { id } });
  }
}

export default BaseModel;
