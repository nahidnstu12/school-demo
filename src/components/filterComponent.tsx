// 'use client';

// import { useDynamicFilters } from '@/hooks/useDynamicFilter';
// import { FilterConfig } from '@/utils/filter-helpers';
// import { useState, useEffect } from 'react';

// // Define filter configuration
// const productFilterConfig: FilterConfig = {
//   fields: {
//     // Define field configurations
//     name: {
//       type: 'string',
//       defaultOperator: 'contains',
//       urlParam: 'q' // Use 'q' in URL instead of 'name'
//     },
//     price: {
//       type: 'number',
//       allowedOperators: ['equals', 'gt', 'lt', 'gte', 'lte', 'between']
//     },
//     category: {
//       type: 'string',
//       defaultOperator: 'equals'
//     },
//     inStock: {
//       type: 'boolean',
//       defaultOperator: 'equals'
//     },
//     tags: {
//       type: 'array',
//       defaultOperator: 'in',
//       multiValue: true
//     },
//     createdAt: {
//       type: 'date',
//       allowedOperators: ['gt', 'lt', 'between']
//     }
//   },
//   defaultSort: { field: 'createdAt', direction: 'desc' },
//   defaultPageSize: 10
// };

// export default function ProductCatalog() {
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(true);

//   // Use our dynamic filter hook
//   const {
//     // Generated Prisma filter
//     prismaFilter,

//     // Current state
//     page,
//     pageSize,

//     // Helpers for reading current values
//     getFilterValue,

//     // Methods for updating state
//     setFilter,
//     removeFilter,
//     setRangeFilter,
//     setSort,
//     setPage,
//     setPageSize,
//     clearAllFilters
//   } = useDynamicFilters(productFilterConfig);

//   // Fetch product data when filter changes
//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);

//       try {
//         // Use FormData to match your server action structure
//         const formData = new FormData();
//         formData.append('filter', JSON.stringify(prismaFilter));

//         const result = await getAllProductsWithFilter(formData);

//         if (result.success) {
//           setProducts(result.data.data);
//           setTotal(result.data.total);
//         } else {
//           console.error('Error fetching products:', result.errors);
//         }
//       } catch (error) {
//         console.error('Error fetching products:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [prismaFilter]);

//   // Fetch categories on mount
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const result = await getProductCategories();

//         if (result.success) {
//           setCategories(result.data);
//         }
//       } catch (error) {
//         console.error('Error fetching categories:', error);
//       }
//     };

//     fetchCategories();
//   }, []);

//   // Get current filter values
//   const searchValue = getFilterValue('name') || '';
//   const categoryValue = getFilterValue('category') || '';
//   const priceRange = getFilterValue('price') || { min: '', max: '' };
//   const inStockValue = getFilterValue('inStock');

//   // Calculate pagination values
//   const totalPages = Math.ceil(total / pageSize);
//   const startItem = (page - 1) * pageSize + 1;
//   const endItem = Math.min(page * pageSize, total);

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-6">Product Catalog</h1>

//       {/* Search and Filters */}
//       <div className="bg-white p-4 rounded shadow mb-6">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           {/* Search */}
//           <div>
//             <label className="block text-sm font-medium mb-1">Search</label>
//             <input
//               type="text"
//               value={searchValue}
//               onChange={(e) => setFilter('name', 'contains', e.target.value)}
//               placeholder="Search products..."
//               className="w-full p-2 border rounded"
//             />
//           </div>

//           {/* Price Range */}
//           <div>
//             <label className="block text-sm font-medium mb-1">Price Range</label>
//             <div className="flex items-center gap-2">
//               <input
//                 type="number"
//                 value={priceRange.min || ''}
//                 onChange={(e) => setRangeFilter(
//                   'price',
//                   e.target.value ? Number(e.target.value) : undefined,
//                   priceRange.max
//                 )}
//                 placeholder="Min"
//                 className="w-full p-2 border rounded"
//               />
//               <span>to</span>
//               <input
//                 type="number"
//                 value={priceRange.max || ''}
//                 onChange={(e) => setRangeFilter(
//                   'price',
//                   priceRange.min,
//                   e.target.value ? Number(e.target.value) : undefined
//                 )}
//                 placeholder="Max"
//                 className="w-full p-2 border rounded"
//               />
//             </div>
//           </div>

//           {/* Category */}
//           <div>
//             <label className="block text-sm font-medium mb-1">Category</label>
//             <select
//               value={categoryValue}
//               onChange={(e) => {
//                 const value = e.target.value;
//                 if (value) {
//                   setFilter('category', 'equals', value);
//                 } else {
//                   removeFilter('category');
//                 }
//               }}
//               className="w-full p-2 border rounded"
//             >
//               <option value="">All Categories</option>
//               {categories.map((cat) => (
//                 <option key={cat} value={cat}>
//                   {cat}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* In Stock Filter */}
//           <div>
//             <label className="block text-sm font-medium mb-1">Availability</label>
//             <div className="flex items-center mt-1">
//               <input
//                 type="checkbox"
//                 checked={inStockValue === true}
//                 onChange={(e) => {
//                   if (e.target.checked) {
//                     setFilter('inStock', 'equals', true);
//                   } else {
//                     removeFilter('inStock');
//                   }
//                 }}
//                 className="mr-2"
//               />
//               <span>In Stock Only</span>
//             </div>
//           </div>
//         </div>

//         {/* Sort By */}
//         <div className="mt-4 flex justify-between">
//           <div className="flex items-center gap-2">
//             <span className="text-sm font-medium">Sort By:</span>
//             <select
//               onChange={(e) => {
//                 const [field, direction] = e.target.value.split(':');
//                 setSort(field, direction as 'asc' | 'desc');
//               }}
//               className="p-2 border rounded"
//             >
//               <option value="name:asc">Name (A-Z)</option>
//               <option value="name:desc">Name (Z-A)</option>
//               <option value="price:asc">Price (Low to High)</option>
//               <option value="price:desc">Price (High to Low)</option>
//               <option value="createdAt:desc">Newest First</option>
//               <option value="createdAt:asc">Oldest First</option>
//             </select>
//           </div>

//           {/* Clear Filters */}
//           <button
//             onClick={clearAllFilters}
//             className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
//           >
//             Clear Filters
//           </button>
//         </div>
//       </div>

//       {/* Products List */}
//       <div className="bg-white rounded shadow">
//         {loading ? (
//           <div className="p-8 text-center">Loading products...</div>
//         ) : products.length === 0 ? (
//           <div className="p-8 text-center">No products found matching your filters.</div>
//         ) : (
//           <>
//             <table className="min-w-full">
//               <thead>
//                 <tr className="bg-gray-100">
//                   <th className="py-2 px-4 text-left">Product</th>
//                   <th className="py-2 px-4 text-left">Category</th>
//                   <th className="py-2 px-4 text-right">Price</th>
//                   <th className="py-2 px-4 text-center">Status</th>
//                   <th className="py-2 px-4 text-center">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {products.map((product) => (
//                   <tr key={product.id} className="border-t hover:bg-gray-50">
//                     <td className="py-3 px-4">
//                       <div className="font-medium">{product.name}</div>
//                       <div className="text-sm text-gray-500">{product.description?.substring(0, 60)}...</div>
//                     </td>
//                     <td className="py-3 px-4">{product.category}</td>
//                     <td className="py-3 px-4 text-right">${product.price.toFixed(2)}</td>
//                     <td className="py-3 px-4 text-center">
//                       <span className={`px-2 py-1 rounded text-xs ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                         {product.inStock ? 'In Stock' : 'Out of Stock'}
//                       </span>
//                     </td>
//                     <td className="py-3 px-4 text-center">
//                       <button className="text-blue-500 hover:underline mr-2">View</button>
//                       <button className="text-green-500 hover:underline">Edit</button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {/* Pagination */}
//             <div className="flex items-center justify-between p-4 border-t">
//               <div className="text-sm text-gray-500">
//                 Showing {startItem} - {endItem} of {total} items
//               </div>

//               <div className="flex gap-1">
//                 <select
//                   value={pageSize}
//                   onChange={(e) => setPageSize(Number(e.target.value))}
//                   className="p-2 border rounded text-sm"
//                 >
//                   <option value="5">5 per page</option>
//                   <option value="10">10 per page</option>
//                   <option value="25">25 per page</option>
//                   <option value="50">50 per page</option>
//                 </select>

//                 <button
//                   disabled={page <= 1}
//                   onClick={() => setPage(page - 1)}
//                   className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
//                 >
//                   Previous
//                 </button>

//                 <div className="flex">
//                   {[...Array(Math.min(5, totalPages))].map((_, i) => {
//                     const pageNum = i + 1;
//                     return (
//                       <button
//                         key={i}
//                         onClick={() => setPage(pageNum)}
//                         className={`w-10 h-10 ${
//                           pageNum === page
//                             ? 'bg-blue-500 text-white'
//                             : 'hover:bg-gray-100'
//                         }`}
//                       >
//                         {pageNum}
//                       </button>
//                     );
//                   })}

//                   {totalPages > 5 && (
//                     <>
//                       <span className="w-10 h-10 flex items-center justify-center">...</span>
//                       <button
//                         onClick={() => setPage(totalPages)}
//                         className={`w-10 h-10 ${
//                           totalPages === page
//                             ? 'bg-blue-500 text-white'
//                             : 'hover:bg-gray-100'
//                         }`}
//                       >
//                         {totalPages}
//                       </button>
//                     </>
//                   )}
//                 </div>

//                 <button
//                   disabled={page >= totalPages}
//                   onClick={() => setPage(page + 1)}
//                   className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           </>
//         )}
//       </div>

//       {/* Debug Panel */}
//       {process.env.NODE_ENV === 'development' && (
//         <div className="mt-8 p-4 bg-gray-100 rounded">
//           <h3 className="font-bold mb-2">Debug - Generated Prisma Filter:</h3>
//           <pre className="bg-white p-4 rounded overflow-auto text-sm">
//             {JSON.stringify(prismaFilter, null, 2)}
//           </pre>
//         </div>
//       )}
//     </div>
//   );
// }
