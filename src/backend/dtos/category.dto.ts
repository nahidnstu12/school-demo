'use server';

import { Category } from '@prisma/client';

class CategoryDTO {
  static toDetail(category: Category) {
    return {
      id: category.id,
      name: category.name,
    };
  }

  static toList(category: Category) {
    return {
      id: category.id,
      name: category.name,
    };
  }
}

export default CategoryDTO;
