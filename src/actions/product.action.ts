'use server';

import { Product, Prisma } from '@prisma/client';
import { z } from 'zod';
import BaseServerAction from './base.action';
import productSchema, {
  productCreateSchema,
  ProductFormValues,
  productUpdateSchema,
} from '@/schemas/product';
import ProductService from '@/services/product.service';
import { ActionResult } from './IServerAction';
import { FilterBuilder } from '@/utils/filterBuilder';

class ProductServerAction extends BaseServerAction<
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
    super(schema, service);
  }

  /**
   * Create a new product
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
   * Update a product
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
   * Get products with filtering
   */
  async getProductsWithFilter(formData: FormData): Promise<ActionResult<any>> {
    try {
      // Extract filter parameters from form data
      const search = (formData.get('search') as string) || '';
      const category = (formData.get('category') as string) || '';
      const minPrice = formData.get('minPrice')
        ? parseFloat(formData.get('minPrice') as string)
        : null;
      const maxPrice = formData.get('maxPrice')
        ? parseFloat(formData.get('maxPrice') as string)
        : null;
      const inStock = formData.has('inStock') ? formData.get('inStock') === 'true' : null;
      const featured = formData.has('featured') ? formData.get('featured') === 'true' : null;
      const tagsParam = (formData.get('tags') as string) || '';
      const tags = tagsParam ? tagsParam.split(',').map((t) => t.trim()) : [];

      // Extract pagination parameters
      const page = parseInt((formData.get('page') as string) || '1');
      const pageSize = parseInt((formData.get('pageSize') as string) || '10');

      // Extract sorting parameters
      const sortField = (formData.get('sortField') as string) || 'createdAt';
      const sortDirection = ((formData.get('sortDirection') as string) || 'desc') as 'asc' | 'desc';

      // Check for raw filter object
      let filterObject: any = {};
      const filterJson = formData.get('filter') as string;

      if (filterJson) {
        try {
          filterObject = JSON.parse(filterJson);
        } catch (e) {
          // If JSON parsing fails, we'll just use the individual parameters
        }
      }

      // If no raw filter provided, build from parameters
      if (Object.keys(filterObject).length === 0) {
        const filterBuilder = new FilterBuilder();

        // Add search filter
        if (search) {
          filterBuilder.or([
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ]);
        }

        // Add category filter
        if (category) {
          filterBuilder.where('category', 'equals', category);
        }

        // Add price range filter
        if (minPrice !== null && maxPrice !== null) {
          filterBuilder.where('price', 'between', [minPrice, maxPrice]);
        } else if (minPrice !== null) {
          filterBuilder.where('price', 'gte', minPrice);
        } else if (maxPrice !== null) {
          filterBuilder.where('price', 'lte', maxPrice);
        }

        // Add stock filter
        if (inStock !== null) {
          filterBuilder.where('stock', inStock ? 'gt' : 'equals', 0);
        }

        // Add featured filter
        if (featured !== null) {
          filterBuilder.where('featured', 'equals', featured);
        }

        // Add tags filter
        if (tags.length > 0) {
          filterBuilder.where('tags', 'hasSome', tags);
        }

        // Add sorting
        filterBuilder.orderBy(sortField, sortDirection);

        // Add pagination
        filterBuilder.paginate(page, pageSize);

        // Get filter object
        filterObject = filterBuilder.build();
      }
      // console.log({  filterObject: filterObject.where.name });

      // Get data with pagination
      const results = await this.service.findAllPaginated(page, pageSize, filterObject);

      return { success: true, data: results };
    } catch (error) {
      return this.handleServiceError(error);
    }
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
   * Get product statistics
   */
  async getProductStats(): Promise<ActionResult<any>> {
    try {
      const stats = await this.service.getProductStats();
      return { success: true, data: stats };
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
   * Search products
   */
  async searchProducts(formData: FormData): Promise<ActionResult<Product[]>> {
    try {
      const query = (formData.get('query') as string) || '';

      if (!query) {
        return {
          success: false,
          errors: [{ field: 'query', message: 'Search query is required' }],
        };
      }

      const products = await this.service.searchProducts(query);
      return { success: true, data: products };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Get related products
   */
  async getRelatedProducts(id: string, formData: FormData): Promise<ActionResult<Product[]>> {
    try {
      const limit = formData.get('limit') ? parseInt(formData.get('limit') as string) : 4;
      const products = await this.service.getRelatedProducts(id, limit);
      return { success: true, data: products };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Get product with reviews
   */
  async getProductWithReviews(id: string): Promise<ActionResult<any>> {
    try {
      const product = await this.service.getProductWithReviews(id);
      return { success: true, data: product };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Update product stock
   */
  async updateProductStock(id: string, formData: FormData): Promise<ActionResult<Product>> {
    try {
      const stockValue = formData.get('stock');

      if (!stockValue) {
        return {
          success: false,
          errors: [{ field: 'stock', message: 'Stock value is required' }],
        };
      }

      const newStock = parseInt(stockValue as string);

      if (isNaN(newStock) || newStock < 0) {
        return {
          success: false,
          errors: [{ field: 'stock', message: 'Stock must be a non-negative number' }],
        };
      }

      const product = await this.service.updateProductStock(id, newStock);
      return { success: true, data: product };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Calculate inventory value
   */
  async getInventoryValue(): Promise<ActionResult<number>> {
    try {
      const value = await this.service.calculateInventoryValue();
      return { success: true, data: value };
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

export async function softDeleteProduct(id: string) {
  return productActionInstance.softDelete(id);
}

export async function getProduct(id: string) {
  return productActionInstance.getById(id);
}

export async function getAllProducts(filters?: any) {
  return productActionInstance.getAll(filters);
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

export async function getProductStats() {
  return productActionInstance.getProductStats();
}

export async function getFeaturedProducts(formData: FormData) {
  return productActionInstance.getFeaturedProducts(formData);
}

export async function searchProducts(formData: FormData) {
  return productActionInstance.searchProducts(formData);
}

export async function getRelatedProducts(id: string, formData: FormData) {
  return productActionInstance.getRelatedProducts(id, formData);
}

export async function getProductWithReviews(id: string) {
  return productActionInstance.getProductWithReviews(id);
}

export async function updateProductStock(id: string, formData: FormData) {
  return productActionInstance.updateProductStock(id, formData);
}

export async function getInventoryValue() {
  return productActionInstance.getInventoryValue();
}
