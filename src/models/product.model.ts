'use server';
import { Product, Prisma, Review } from '@prisma/client';
import { prisma } from '../lib/prisma';
import BaseModel from './base.model';

class ProductModel extends BaseModel<Product> {
  constructor() {
    super(prisma.product, prisma);
  }

  /**
   * Find products by category name
   */
  async findByCategory(category: string): Promise<Product[]> {
    return this.findMany({
      where: { category },
    });
  }

  /**
   * Find products in a price range
   */
  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    return this.findMany({
      where: {
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
      },
    });
  }

  /**
   * Find in-stock products
   */
  async findInStock(): Promise<Product[]> {
    return this.findMany({
      where: {
        stock: {
          gt: 0,
        },
      },
    });
  }

  /**
   * Find out-of-stock products
   */
  async findOutOfStock(): Promise<Product[]> {
    return this.findMany({
      where: {
        stock: 0,
      },
    });
  }

  /**
   * Find products with low stock
   */
  async findLowStock(threshold: number = 5): Promise<Product[]> {
    return this.findMany({
      where: {
        stock: {
          gt: 0,
          lte: threshold,
        },
      },
    });
  }

  /**
   * Find products by tags (all tags must match)
   */
  async findByTags(tags: string[]): Promise<Product[]> {
    return this.findMany({
      where: {
        tags: {
          hasEvery: tags,
        },
      },
    });
  }

  /**
   * Find products by tags (any tag matches)
   */
  async findByAnyTag(tags: string[]): Promise<Product[]> {
    return this.findMany({
      where: {
        tags: {
          hasSome: tags,
        },
      },
    });
  }

  /**
   * Find featured products
   */
  async findFeatured(): Promise<Product[]> {
    return this.findMany({
      where: {
        featured: true,
      },
    });
  }

  /**
   * Search products by name or description
   */
  async search(query: string): Promise<Product[]> {
    return this.findMany({
      where: {
        OR: [{ name: { contains: query } }, { description: { contains: query } }],
      },
    });
  }

  /**
   * Find products with reviews
   */
  async findWithReviews(): Promise<Product[]> {
    return this.findMany({
      where: {
        reviews: {
          some: {},
        },
      },
      include: {
        reviews: true,
      },
    });
  }

  /**
   * Find highly rated products (average rating above threshold)
   */
  //   async findHighlyRated(threshold: number = 4): Promise<any[]> {
  //     // This requires a raw query or complex aggregation
  //     // Using prisma's aggregation features
  //     return await this.model.findMany({
  //       where: {
  //         reviews: {
  //           some: {}
  //         }
  //       },
  //       include: {
  //         reviews: true
  //       }
  //     }).then((products: (Product & { reviews: Review[] })[]) => {
  //       return products.filter(product => {
  //         const reviewCount = product.reviews.length;
  //         if (reviewCount === 0) return false;

  //         const averageRating = product.reviews.reduce(
  //           (sum, review) => sum + review.rating, 0
  //         ) / reviewCount;

  //         return averageRating >= threshold;
  //       });
  //     });
  //   }

  async findHighlyRated(threshold: number = 4): Promise<Product[]> {
    return await this.model.findMany({
      where: {
        reviews: {
          some: {}, // Ensure the product has reviews
        },
      },
      include: {
        reviews: {
          select: {
            rating: true, // Select only ratings
          },
        },
      },
      having: {
        reviews: {
          _avg: {
            rating: {
              gte: threshold, // Filter in database
            },
          },
        },
      },
    });
  }

  /**
   * Get distinct categories
   */
  async getDistinctCategories(): Promise<string[]> {
    const categoriesData = await this.prismaClient.$queryRaw<{ category: string }[]>`
      SELECT DISTINCT category FROM products
      WHERE deleted = false
      ORDER BY category ASC
    `;

    return categoriesData.map((c: { category: string }) => c.category);
  }

  /**
   * Get distinct tags across all products
   */
  async getDistinctTags(): Promise<string[]> {
    const products = await this.findMany({
      select: {
        tags: true,
      },
    });

    // Flatten and deduplicate tags
    const allTags = products.flatMap((product) => product.tags as string[]);
    return [...new Set(allTags)];
  }

  //   async getDistinctTags(): Promise<string[]> {
  //     const result = await this.prismaClient.$queryRaw<string[]>`
  //       SELECT DISTINCT UNNEST(tags) AS tag FROM "Product"
  //     `;

  //     return result.map((row) => row.tag);
  //   }

  /**
   * Update product stock
   */
  async updateStock(id: string, newStock: number): Promise<Product> {
    return this.update(id, { stock: newStock });
  }

  /**
   * Calculate product statistics
   */
  async getProductStats(): Promise<any> {
    return this.aggregate({
      _count: {
        id: true,
      },
      _avg: {
        price: true,
        stock: true,
      },
      _min: {
        price: true,
      },
      _max: {
        price: true,
      },
      _sum: {
        stock: true,
      },
    });
  }

  /**
   * Find products by complex filter (using our custom filter structure)
   */
  async findByFilter(filters: any): Promise<Product[]> {
    // Our mergeFilters will handle combining with soft delete filter
    return this.findMany(filters);
  }
}

export default ProductModel;
