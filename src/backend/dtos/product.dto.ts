'use server';

import { Image, Product, Review } from '@prisma/client';

// Type for Product with related data
export type ProductWithRelations = Product & {
  reviews?: Review[];
  category?: { id: string; name: string };
  images?: Image[];
};

class ProductDTO {
  /**
   * Transform product for detailed view
   */
  static toDetail(product: ProductWithRelations) {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price.toString()),
      category: product.category?.name || product.category,
      stock: product.stock,
      sku: product.sku,
      featured: product.featured,
      //   images: product.images,
      tags: product.tags,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,

      // Computed properties
      inStock: product.stock > 0,
      formattedPrice: `$${parseFloat(product.price.toString()).toFixed(2)}`,

      // Related data
      reviewCount: product.reviews?.length || 0,
      averageRating: product.reviews?.length
        ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(
            1
          )
        : null,

      images:
        product.images?.map((img) => ({
          id: img.id,
          url: img.path, // Assuming path is the URL
          filename: img.filename,
          size: img.size,
          mimetype: img.mimetype,
        })) || [],
    };
  }

  /**
   * Transform product for list view
   */
  static toList(product: ProductWithRelations) {
    return {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price.toString()),
      formattedPrice: `$${parseFloat(product.price.toString()).toFixed(2)}`,
      category: product.category?.name || product.category,
      stock: product.stock,
      inStock: product.stock > 0,
      featured: product.featured,

      // Include primary image if available
      //   image: product.images.length > 0 ? product.images[0] : null,

      // Brief description excerpt
      excerpt: product.description
        ? product.description.length > 100
          ? `${product.description.substring(0, 97)}...`
          : product.description
        : null,

      // Tag count
      //   tagCount: product.tags.length,

      // Review stats
      reviewCount: product.reviews?.length || 0,
      averageRating: product.reviews?.length
        ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(
            1
          )
        : null,
    };
  }

  /**
   * Transform product for admin view
   */
  static toAdmin(product: ProductWithRelations) {
    return {
      ...this.toDetail(product),

      // Include internal/admin fields
      stockStatus:
        product.stock === 0 ? 'Out of Stock' : product.stock < 5 ? 'Low Stock' : 'In Stock',

      stockAlert: product.stock < 5,

      // Revenue potential
      potentialRevenue: parseFloat(product.price.toString()) * product.stock,
    };
  }

  /**
   * Transform product for minimal public API
   */
  static toPublic(product: ProductWithRelations) {
    return {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price.toString()),
      category: product.category?.name || product.category,
      inStock: product.stock > 0,
      featured: product.featured,
      //   image: product.images.length > 0 ? product.images[0] : null,
    };
  }
}

export default ProductDTO;
