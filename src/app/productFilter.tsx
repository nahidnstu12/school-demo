'use client';

import React from 'react';
import { useState, useEffect, FormEvent } from 'react';
import {
  getProductsWithFilter,
  getProductCategories,
  getProductTags,
} from '../actions/product.action';

// Define product type
interface ProductImage {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

interface ProductTag {
  name: string;
  [key: string]: any;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  excerpt?: string;
  price: number;
  formattedPrice: string;
  category: string;
  stock: number;
  sku?: string;
  inStock: boolean;
  featured: boolean;
  images?: ProductImage[];
  tags?: ProductTag[] | string[] | Record<string, ProductTag>;
  reviewCount?: number;
  averageRating?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProductList() {
  // State for filter form values
  const [filterValues, setFilterValues] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    tag: '',
    inStock: false,
    featured: false,
    sortField: 'createdAt',
    sortDirection: 'desc',
  });

  // State for products and metadata
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Calculate pagination values
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFilterValues({
        ...filterValues,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setFilterValues({
        ...filterValues,
        [name]: value,
      });
    }
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [field, direction] = e.target.value.split(':');
    setFilterValues({
      ...filterValues,
      sortField: field,
      sortDirection: direction,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await fetchProducts(1); // Reset to first page on new search
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterValues({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      tag: '',
      inStock: false,
      featured: false,
      sortField: 'createdAt',
      sortDirection: 'desc',
    });
    // Don't fetch here - wait for submit button
  };

  // Function to fetch products based on current filters
  const fetchProducts = async (pageNumber: number = page) => {
    setLoading(true);

    try {
      // Build filter object
      const filter: any = {
        where: {},
        orderBy: { [filterValues.sortField]: filterValues.sortDirection },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
      };

      // Add search filter
      if (filterValues.search) {
        filter.where.name = { contains: filterValues.search };
      }

      // Add category filter
      if (filterValues.category) {
        filter.where.category = { equals: filterValues.category };
      }

      // Add price range filter
      if (filterValues.minPrice || filterValues.maxPrice) {
        filter.where.price = {};

        if (filterValues.minPrice) {
          filter.where.price.gte = parseFloat(filterValues.minPrice);
        }

        if (filterValues.maxPrice) {
          filter.where.price.lte = parseFloat(filterValues.maxPrice);
        }
      }

      // Add tag filter
      if (filterValues.tag) {
        // This assumes you have a proper way to query JSON fields in your backend
        filter.where.tags = { contains: filterValues.tag };
      }

      // Add stock filter
      if (filterValues.inStock) {
        filter.where.stock = { gt: 0 };
      }

      // Add featured filter
      if (filterValues.featured) {
        filter.where.featured = { equals: true };
      }

      // Send to server
      const formData = new FormData();
      formData.append('filter', JSON.stringify(filter));

      const result = await getProductsWithFilter(formData);

      if (result.success) {
        setProducts(result.data.data);
        setTotal(result.data.total);
        setPage(pageNumber); // Update page after successful fetch
      } else {
        console.error('Error fetching products:', result.errors);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    fetchProducts(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    fetchProducts(1); // Reset to first page when changing page size
  };

  // Fetch categories and tags on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Fetch categories
        const categoriesResult = await getProductCategories();
        if (categoriesResult.success) {
          setCategories(categoriesResult.data);
        }

        // Fetch tags
        const tagsResult = await getProductTags();
        if (tagsResult.success) {
          setTags(tagsResult.data);
        }
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    };

    fetchMetadata();
    fetchProducts(); // Initial product fetch
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      {/* Filter Panel */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium mb-1">
              Search
            </label>
            <input
              id="search"
              name="search"
              type="text"
              value={filterValues.search}
              onChange={handleInputChange}
              placeholder="Search products..."
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={filterValues.category}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium mb-1">Price Range</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="minPrice"
                value={filterValues.minPrice}
                onChange={handleInputChange}
                placeholder="Min"
                className="w-full p-2 border rounded"
              />
              <span>to</span>
              <input
                type="number"
                name="maxPrice"
                value={filterValues.maxPrice}
                onChange={handleInputChange}
                placeholder="Max"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Tags */}
          <div>
            <label htmlFor="tag" className="block text-sm font-medium mb-1">
              Tag
            </label>
            <select
              id="tag"
              name="tag"
              value={filterValues.tag}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="">All Tags</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filters */}
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="inStock"
                checked={filterValues.inStock}
                onChange={handleInputChange}
                className="mr-1"
              />
              <span>In Stock Only</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={filterValues.featured}
                onChange={handleInputChange}
                className="mr-1"
              />
              <span>Featured Products</span>
            </label>
          </div>
        </div>

        {/* Sort and Filter Controls */}
        <div className="mt-4 flex justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sort By:</span>
            <select
              onChange={handleSortChange}
              value={`${filterValues.sortField}:${filterValues.sortDirection}`}
              className="p-2 border rounded"
            >
              <option value="name:asc">Name (A-Z)</option>
              <option value="name:desc">Name (Z-A)</option>
              <option value="price:asc">Price (Low to High)</option>
              <option value="price:desc">Price (High to Low)</option>
              <option value="createdAt:desc">Newest First</option>
              <option value="createdAt:asc">Oldest First</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* Submit Button */}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Apply Filters
            </button>

            {/* Clear Filters */}
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </form>

      {/* Products List */}
      <div className="bg-white rounded shadow">
        {loading ? (
          <div className="p-8 text-center">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">No products found matching your filters.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {products.map((product: Product) => (
                <div key={product.id} className="border rounded overflow-hidden hover:shadow-lg">
                  {/* Image */}
                  <div className="h-48 bg-gray-200 relative">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}

                    {/* Featured badge */}
                    {product.featured && (
                      <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Product details */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{product.name}</h3>
                      <span className="font-bold text-blue-600">{product.formattedPrice}</span>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">{product.category}</div>

                    {product.excerpt && (
                      <p className="text-sm text-gray-500 mb-3">{product.excerpt}</p>
                    )}

                    {/* Tags */}
                    {product.tags && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {Array.isArray(product.tags)
                          ? // If tags is an array
                            product.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                              >
                                {typeof tag === 'string' ? tag : tag.name || tag}
                              </span>
                            ))
                          : typeof product.tags === 'object'
                            ? // If tags is an object with names
                              Object.entries(product.tags).map(([key, value], index) => (
                                <span
                                  key={index}
                                  className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                                >
                                  {value.name || key}
                                </span>
                              ))
                            : null}
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span
                        className={`text-sm px-2 py-1 rounded ${
                          product.inStock
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>

                      <button type="button" className="text-blue-500 hover:underline">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-gray-500">
                Showing {startItem} - {endItem} of {total} items
              </div>

              <div className="flex gap-1">
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="p-2 border rounded text-sm"
                >
                  <option value="6">6 per page</option>
                  <option value="12">12 per page</option>
                  <option value="24">24 per page</option>
                  <option value="48">48 per page</option>
                </select>

                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Previous
                </button>

                <div className="flex">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 ${
                          pageNum === page ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {totalPages > 5 && (
                    <>
                      <span className="w-10 h-10 flex items-center justify-center">...</span>
                      <button
                        type="button"
                        onClick={() => handlePageChange(totalPages)}
                        className={`w-10 h-10 ${
                          totalPages === page ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Debug Panel (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Debug - Current Filter:</h3>
          <pre className="bg-white p-4 rounded overflow-auto text-sm">
            {JSON.stringify(filterValues, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
