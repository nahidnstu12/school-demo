'use server';

import { Category, Prisma } from '@prisma/client';
import CategoryModel from '../models/category';
import BaseService from './base.service';
import CategoryDTO from '../dtos/category.dto';

/**
 * Institution service that extends the base service
 */
class CategoryService extends BaseService<
  Category,
  Prisma.CategoryCreateInput,
  Prisma.CategoryUpdateInput,
  CategoryModel,
  typeof CategoryDTO
> {
  constructor(
    model: CategoryModel = new CategoryModel(),
    dto: typeof CategoryDTO = CategoryDTO
  ) {
    super(model, dto);
  }
}

export default CategoryService;
