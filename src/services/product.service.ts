'use server';
import ProductDTO from '@/dtos/product.dto';
import ProductModel from '@/models/product.model';
import { Prisma, Product } from '@prisma/client';
import BaseService from './base.service';

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

    return this.transformData(product, 'toDetail');
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
