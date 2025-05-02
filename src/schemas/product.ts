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

  tags: z.array(z.string()).optional().default([]),
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

// Schema for filtering products
export const productFilterSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  price: z.coerce.number().optional(),
  stock: z.coerce.number().optional(),
  featured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateProductInput = z.infer<typeof productCreateSchema>;
export type UpdateProductInput = z.infer<typeof productUpdateSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;

export const productFilterConfig: FilterConfig = {
  defaultPageSize: 10,
  defaultSort: { field: 'createdAt', direction: 'desc' as const },
  fields: {
    name: { type: 'string', defaultOperator: 'contains' },
    category: { type: 'string', defaultOperator: 'equals' },
    price: { type: 'number', defaultOperator: 'gte' },
    stock: { type: 'number', defaultOperator: 'gte' },
    featured: { type: 'boolean', defaultOperator: 'equals' },
    createdAt: { type: 'date', defaultOperator: 'equals' },
  },
};

export default productSchema;
