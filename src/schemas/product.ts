// app/schemas/productSchema.ts
import { FilterConfig } from '@/utils/filter-helpers';
import { z } from 'zod';

// Base Product schema
export const productSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Product name must be at least 2 characters' })
    .max(100, { message: 'Product name cannot exceed 100 characters' }),

  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters' })
    .max(1000, { message: 'Description cannot exceed 1000 characters' })
    .optional(),

  price: z.coerce
    .number()
    .positive({ message: 'Price must be a positive number' })
    .min(0.01, { message: 'Price must be at least 0.01' }),

  category: z.string().min(1, { message: 'Category is required' }),

  stock: z.coerce
    .number()
    .int({ message: 'Stock must be a whole number' })
    .nonnegative({ message: 'Stock cannot be negative' }),

  sku: z
    .string()
    .min(3, { message: 'SKU must be at least 3 characters' })
    .max(50, { message: 'SKU cannot exceed 50 characters' })
    .optional(),

  featured: z.boolean().default(false).optional(),

  //   images: z.array(z.string().url({ message: 'Image must be a valid URL' }))
  //     .optional()
  //     .default([]),

  tags: z.any(z.string()).optional().default([]),
});

// Type for Product form values
export type ProductFormValues = z.infer<typeof productSchema>;

// Schema for product create input (can have additional validation specific to creation)
export const productCreateSchema = productSchema.extend({
  // Require SKU for new products
  sku: z
    .string()
    .min(3, { message: 'SKU must be at least 3 characters' })
    .max(50, { message: 'SKU cannot exceed 50 characters' }),
});

// Schema for product update (all fields optional)
export const productUpdateSchema = productSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

// Schema for filtering products //TODO: need to further work
export const productFilterSchema = z.object({
  name: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  category: z.string().optional(),
  inStock: z.boolean().optional(),
  featured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  page: z.coerce.number().positive().optional(),
  pageSize: z.coerce.number().positive().optional(),
  sortField: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
});

export const productFilterConfig: FilterConfig = {
  fields: {
    name: { type: 'string', defaultOperator: 'contains', urlParam: 'search' },
    category: { type: 'string', defaultOperator: 'equals' },
    price: { type: 'number' },
    tag: { type: 'string', defaultOperator: 'contains', urlParam: 'tag' },
    stock: { type: 'number' },
    featured: { type: 'boolean' },
  },
  defaultPageSize: 12,
  defaultSort: { field: 'createdAt', direction: 'desc' as const },
};

export default productSchema;
