'use server';
import { Product, Prisma } from '@prisma/client';
import { z } from 'zod';
import productSchema, {
  productCreateSchema,
  ProductFormValues,
  productUpdateSchema,
} from '@/schemas/product';
import ProductService from '@/services/product.service';
import { ActionResult } from './IServerAction';
import {
  RelationalServerAction,
  RelationalFilterConfig,
  RelationFieldMapping,
} from './relation.action';
import { filterConfig } from '@/utils/default-value';

// Define relation mappings for products if any exist
const productRelationMapping: RelationFieldMapping = {
  // Add mappings for any relations in the Product model
  // For example if Product has a Category relation:
  // categoryName: { relation: 'category', field: 'name' }
};

// Convert the product filterConfig to a RelationalFilterConfig
const productRelationalConfig: RelationalFilterConfig = {
  defaultPageSize: filterConfig.defaultPageSize,
  defaultSort: filterConfig.defaultSort,
  fields: {
    name: { type: 'string', defaultOperator: 'contains', urlParam: 'search' },
    category: { type: 'string', defaultOperator: 'equals' },
    price: { type: 'number' },
    tag: { type: 'string', defaultOperator: 'contains', urlParam: 'tag' },
    stock: { type: 'number' },
    featured: { type: 'boolean' },
  },
  relationMappings: productRelationMapping,
  // Define search fields explicitly
  searchFields: [
    { field: 'name' },
    { field: 'description' },
    // Add any other searchable fields
  ],
};

class ProductServerAction extends RelationalServerAction<
  ProductFormValues,
  Prisma.ProductCreateInput,
  Prisma.ProductUpdateInput,
  Product,
  ProductService
> {
  constructor(
    schema: z.ZodType<ProductFormValues> = productSchema,
    service: ProductService = new ProductService()
  ) {
    super(schema, service, productRelationalConfig, productRelationMapping);
  }

  /**
   * Create a new product with tags and images handling
   */
  async create(formData: FormData): Promise<ActionResult<Product>> {
    // Override to use the createSchema
    const validatedData = this.validateWithSchema(formData, productCreateSchema);

    if (!validatedData.success) return validatedData;

    try {
      // Process tags as an array
      const tags = this.processTagsArray(formData);

      // Process images as an array
      const images = this.processImagesArray(formData);

      // Combine with validated data
      const productData = {
        ...validatedData.data,
        tags,
        images,
      };

      const result = await this.service.create(productData as Prisma.ProductCreateInput);
      return { success: true, data: result };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Update a product with tags and images handling
   */
  async update(id: string, formData: FormData): Promise<ActionResult<Product>> {
    // Override to use the updateSchema
    const validatedData = this.validateWithSchema(formData, productUpdateSchema);

    if (!validatedData.success) return validatedData;

    try {
      // Process tags and images only if they were included in the form
      let updateData: any = { ...validatedData.data };

      // Process tags if present in form
      if (formData.has('tags')) {
        updateData.tags = this.processTagsArray(formData);
      }

      // Process images if present in form
      if (formData.has('images')) {
        updateData.images = this.processImagesArray(formData);
      }

      const result = await this.service.update(id, updateData as Prisma.ProductUpdateInput);
      return { success: true, data: result };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Get products with filtering - Uses the base class implementation
   */
  async getProductsWithFilter(formData: FormData): Promise<ActionResult<any>> {
    return this.getItemsWithFilter(formData);
  }

  /**
   * Get product categories
   */
  async getProductCategories(): Promise<ActionResult<string[]>> {
    try {
      const categories = await this.service.getDistinctCategories();
      return { success: true, data: categories };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Get product tags
   */
  async getProductTags(): Promise<ActionResult<string[]>> {
    try {
      const tags = await this.service.getDistinctTags();
      return { success: true, data: tags };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(formData: FormData): Promise<ActionResult<Product[]>> {
    try {
      const limit = formData.get('limit') ? parseInt(formData.get('limit') as string) : 6;
      const products = await this.service.findFeaturedProducts(limit);
      return { success: true, data: products };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Helper method to validate with a specific schema
   */
  private validateWithSchema(
    formData: FormData,
    schema: z.ZodType<any>
  ):
    | { success: true; data: any }
    | { success: false; errors: { field: string | number; message: string }[] } {
    try {
      const data = Object.fromEntries(formData.entries()) as Record<string, unknown>;

      // Parse and validate the data with the provided schema
      const validatedData = schema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        }));
        return { success: false, errors };
      }
      return {
        success: false,
        errors: [{ field: 'unknown', message: 'Unexpected error from form validation' }],
      };
    }
  }

  /**
   * Helper method to process tags from form data
   */
  private processTagsArray(formData: FormData): string[] {
    const tagsValue = formData.get('tags');

    if (!tagsValue) return [];

    // Handle JSON array format
    if (typeof tagsValue === 'string' && tagsValue.startsWith('[') && tagsValue.endsWith(']')) {
      try {
        return JSON.parse(tagsValue);
      } catch (e) {
        // Fall back to comma-separated handling
      }
    }

    // Handle comma-separated format
    if (typeof tagsValue === 'string') {
      return tagsValue
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
    }

    return [];
  }

  /**
   * Helper method to process images from form data
   */
  private processImagesArray(formData: FormData): string[] {
    const imagesValue = formData.get('images');

    if (!imagesValue) return [];

    // Handle JSON array format
    if (
      typeof imagesValue === 'string' &&
      imagesValue.startsWith('[') &&
      imagesValue.endsWith(']')
    ) {
      try {
        return JSON.parse(imagesValue);
      } catch (e) {
        // Fall back to comma-separated handling
      }
    }

    // Handle comma-separated format
    if (typeof imagesValue === 'string') {
      return imagesValue
        .split(',')
        .map((url) => url.trim())
        .filter(Boolean);
    }

    return [];
  }
}

// Create singleton instance
const productActionInstance = new ProductServerAction();

// Export server actions for use in components and API routes
export async function createProduct(formData: FormData) {
  return productActionInstance.create(formData);
}

export async function updateProduct(id: string, formData: FormData) {
  return productActionInstance.update(id, formData);
}

export async function deleteProduct(id: string) {
  return productActionInstance.delete(id);
}

export async function getProduct(id: string) {
  return productActionInstance.getById(id);
}

export async function getProductsWithFilter(formData: FormData) {
  return productActionInstance.getProductsWithFilter(formData);
}

export async function getProductCategories() {
  return productActionInstance.getProductCategories();
}

export async function getProductTags() {
  return productActionInstance.getProductTags();
}

export async function getFeaturedProducts(formData: FormData) {
  return productActionInstance.getFeaturedProducts(formData);
}
