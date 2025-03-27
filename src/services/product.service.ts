'use server';
import { Product, Prisma } from '@prisma/client';
import BaseService from './base.service';
import ProductModel from '@/models/product.model';
import ProductDTO from '@/dtos/product.dto';
import { FilterBuilder } from '@/utils/filterBuilder';

class ProductService extends BaseService<
  Product,
  Prisma.ProductCreateInput,
  Prisma.ProductUpdateInput,
  ProductModel,
  typeof ProductDTO
> {
  constructor(model: ProductModel = new ProductModel(), dto: typeof ProductDTO = ProductDTO) {
    super(model, dto);
  }

  /**
   * Get distinct product categories
   */
  async getDistinctCategories(): Promise<string[]> {
    const model = this.model as ProductModel;
    return await model.getDistinctCategories();
  }

  /**
   * Get distinct product tags
   */
  async getDistinctTags(): Promise<string[]> {
    const model = this.model as ProductModel;
    return await model.getDistinctTags();
  }

  /**
   * Get product statistics
   */
  async getProductStats(): Promise<any> {
    const model = this.model as ProductModel;
    const stats = await model.getProductStats();

    const lowStockCount = (await model.findLowStock()).length;
    const outOfStockCount = (await model.findOutOfStock()).length;
    const featuredCount = (await model.findFeatured()).length;

    return {
      ...stats,
      lowStockCount,
      outOfStockCount,
      featuredCount,
      averagePrice: stats._avg.price ? parseFloat(stats._avg.price.toString()) : 0,
      totalProducts: stats._count.id,
      totalValue: parseFloat(stats._avg.price.toString()) * stats._sum.stock,
    };
  }

  /**
   * Find products by filter options
   */
  async findByFilterOptions(options: any): Promise<Product[]> {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      inStock,
      featured,
      tags,
      sortField = 'createdAt',
      sortDirection = 'desc',
    } = options;

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
    if (
      minPrice !== undefined &&
      minPrice !== null &&
      maxPrice !== undefined &&
      maxPrice !== null
    ) {
      filterBuilder.where('price', 'between', [minPrice, maxPrice]);
    } else if (minPrice !== undefined && minPrice !== null) {
      filterBuilder.where('price', 'gte', minPrice);
    } else if (maxPrice !== undefined && maxPrice !== null) {
      filterBuilder.where('price', 'lte', maxPrice);
    }

    // Add stock filter
    if (inStock === true) {
      filterBuilder.where('stock', 'gt', 0);
    } else if (inStock === false) {
      filterBuilder.where('stock', 'equals', 0);
    }

    // Add featured filter
    if (featured !== undefined) {
      filterBuilder.where('featured', 'equals', featured);
    }

    // Add tags filter
    if (tags && Array.isArray(tags) && tags.length > 0) {
      filterBuilder.where('tags', 'hasSome', tags);
    }

    // Add sorting
    filterBuilder.orderBy(sortField, sortDirection as 'asc' | 'desc');

    // Get filter object
    const filter = filterBuilder.build();

    // Get products using your existing model
    return await this.model.findMany(filter);
  }

  /**
   * Find products by category
   */
  async findByCategory(category: string): Promise<Product[]> {
    const model = this.model as ProductModel;
    const products = await model.findByCategory(category);
    return this.transformData(products, 'toList');
  }

  /**
   * Find products by price range
   */
  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    const model = this.model as ProductModel;
    const products = await model.findByPriceRange(minPrice, maxPrice);
    return this.transformData(products, 'toList');
  }

  /**
   * Find featured products
   */
  async findFeaturedProducts(limit: number = 6): Promise<Product[]> {
    const model = this.model as ProductModel;
    const products = await model.findMany({
      where: {
        featured: true,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return this.transformData(products, 'toList');
  }

  /**
   * Search products
   */
  async searchProducts(query: string): Promise<Product[]> {
    const model = this.model as ProductModel;
    const products = await model.search(query);
    return this.transformData(products, 'toList');
  }

  /**
   * Get related products
   */
  async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    // Get the product to find related items
    const product = await this.findById(productId);

    if (!product) {
      return [];
    }

    // Find products in the same category, excluding this one
    const relatedProducts = await this.model.findMany({
      where: {
        category: product.category,
        id: {
          not: productId,
        },
      },
      take: limit,
    });

    return this.transformData(relatedProducts, 'toList');
  }

  /**
   * Get product with reviews
   */
  async getProductWithReviews(productId: string): Promise<any> {
    const product = await this.model.findFirst({
      where: {
        id: productId,
      },
      include: {
        reviews: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return this.transformData(product, 'toProfile');
  }

  /**
   * Calculate total inventory value
   */
  async calculateInventoryValue(): Promise<number> {
    const result = await this.model.aggregate({
      _sum: {
        inventoryValue: {
          _multiply: [{ $toDecimal: '$price' }, { $toInt: '$stock' }],
        },
      },
    });

    return result._sum?.inventoryValue ? parseFloat(result._sum.inventoryValue.toString()) : 0;
  }

  /**
   * Update product stock
   */
  async updateProductStock(id: string, newStock: number): Promise<Product> {
    const model = this.model as ProductModel;
    return await model.updateStock(id, newStock);
  }
}

export default ProductService;
