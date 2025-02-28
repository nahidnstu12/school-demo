'use server';

import { Prisma } from '@prisma/client';

class BaseModel<T> {
  protected model: T;

  constructor(model: T) {
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
}

export default BaseModel;
