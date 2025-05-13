'use server';

import { prisma } from '@/lib/prisma';
import { Category } from '@prisma/client';
import BaseModel from './base.model';

class CategoryModel extends BaseModel<Category> {
  constructor() {
    super(prisma.category);
  }
}

export default CategoryModel;
