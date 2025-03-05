// 'use server';

// import { Prisma } from '@prisma/client';

// class BaseService<
//   T extends { findUnique: any; findMany: any; create: any; update: any; delete: any },
//   CreateInput,
//   UpdateInput,
//   DTO = null,
// > {
//   protected model: T;
//   protected DTOClass?: DTO;

//   constructor(model: T, DTOClass?: DTO) {
//     this.model = model;
//     this.DTOClass = DTOClass;
//   }

//   private transformData(data: any, method: keyof DTO) {
//     if (!this.DTOClass || typeof this.DTOClass[method] !== 'function' || !data) return data;
//     return Array.isArray(data)
//       ? data.map((item) => (this.DTOClass as any)[method](item))
//       : (this.DTOClass as any)[method](data);
//   }

//   async findById(
//     id: number | string,
//     transformMethod: keyof DTO = 'toProfile' as keyof DTO
//   ): Promise<T | null> {
//     const data = await this.model.findUnique({ where: { id } });
//     return this.transformData(data, transformMethod);
//   }

//   async findAll(
//     filters?: Prisma.Args<T, 'findMany'>,
//     transformMethod: keyof DTO = 'toList' as keyof DTO
//   ) {
//     const data = await this.model.findMany(filters);
//     return this.transformData(data, transformMethod);
//   }

//   async create(data: CreateInput) {
//     return await this.model.create({ data });
//   }

//   async update(id: number | string, data: UpdateInput) {
//     return await this.model.update({ where: { id }, data });
//   }

//   async delete(id: number | string) {
//     return await this.model.delete({ where: { id } });
//   }
// }

// export default BaseService;

'use server';

import { Prisma } from '@prisma/client';

class BaseService<
  T extends { findUnique: any; findMany: any; create: any; update: any; delete: any },
  CreateInput,
  UpdateInput,
  DTO = null,
> {
  protected model: T;
  protected DTOClass?: DTO;

  constructor(model: T, DTOClass?: DTO) {
    this.model = model;
    this.DTOClass = DTOClass;
  }

  // Changed from private to protected so child classes can use it
  protected transformData(data: any, method: keyof DTO) {
    if (!this.DTOClass || typeof this.DTOClass[method] !== 'function' || !data) return data;

    return Array.isArray(data)
      ? data.map((item) => (this.DTOClass as any)[method](item))
      : (this.DTOClass as any)[method](data);
  }

  async findById(id: number | string, transformMethod: keyof DTO = 'toProfile' as keyof DTO) {
    const data = await this.model.findUnique({ where: { id } });
    return this.transformData(data, transformMethod);
  }

  async findAll(
    filters?: Prisma.Args<T, 'findMany'>,
    transformMethod: keyof DTO = 'toList' as keyof DTO
  ) {
    const data = await this.model.findMany(filters);
    return this.transformData(data, transformMethod);
  }

  async create(data: CreateInput) {
    return await this.model.create({ data });
  }

  async update(id: number | string, data: UpdateInput) {
    return await this.model.update({ where: { id }, data });
  }

  async delete(id: number | string) {
    return await this.model.delete({ where: { id } });
  }
}

export default BaseService;
