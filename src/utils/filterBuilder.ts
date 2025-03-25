/**
 * Filter Builder that works with your existing mergeFilters method
 */
export class FilterBuilder {
  private filter: any = {};

  constructor(initialFilter = {}) {
    this.filter = { ...initialFilter };
  }

  // Return the final filter object
  build() {
    return this.filter;
  }

  // Set up WHERE clause
  where(field: string, operator: string, value: any) {
    if (!this.filter.where) {
      this.filter.where = {};
    }

    this.applyCondition(this.filter.where, field, operator, value);
    return this;
  }

  // Add AND conditions
  and(conditions: any[]) {
    if (!this.filter.where) {
      this.filter.where = {};
    }

    if (!this.filter.where.AND) {
      this.filter.where.AND = [];
    }

    this.filter.where.AND.push(...conditions);
    return this;
  }

  // Add OR conditions
  or(conditions: any[]) {
    if (!this.filter.where) {
      this.filter.where = {};
    }

    if (!this.filter.where.OR) {
      this.filter.where.OR = [];
    }

    this.filter.where.OR.push(...conditions);
    return this;
  }

  // Add NOT conditions
  not(condition: any) {
    if (!this.filter.where) {
      this.filter.where = {};
    }

    this.filter.where.NOT = condition;
    return this;
  }

  // Add pagination
  skip(value: number) {
    this.filter.skip = value;
    return this;
  }

  take(value: number) {
    this.filter.take = value;
    return this;
  }

  // Shorthand for pagination
  paginate(page: number, perPage: number) {
    this.filter.skip = (page - 1) * perPage;
    this.filter.take = perPage;
    return this;
  }

  // Add orderBy
  orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
    this.filter.orderBy = { [field]: direction };
    return this;
  }

  // Add multiple orderBy
  orderByMany(orders: { field: string; direction: 'asc' | 'desc' }[]) {
    this.filter.orderBy = orders.map(({ field, direction }) => ({
      [field]: direction,
    }));
    return this;
  }

  // Include relations
  include(relations: Record<string, boolean | object>) {
    this.filter.include = relations;
    return this;
  }

  // Select specific fields
  select(fields: Record<string, boolean | object>) {
    this.filter.select = fields;
    return this;
  }

  // Process nested relation filters
  relation(relation: string, nestedFilter: FilterBuilder | object) {
    if (!this.filter.where) {
      this.filter.where = {};
    }

    this.filter.where[relation] =
      nestedFilter instanceof FilterBuilder ? nestedFilter.build() : nestedFilter;

    return this;
  }

  // Helper to apply condition based on operator
  private applyCondition(target: any, field: string, operator: string, value: any) {
    // Skip undefined or null values
    if (value === undefined || value === null) {
      return;
    }

    const fieldParts = field.split('.');

    // For non-nested fields
    if (fieldParts.length === 1) {
      switch (operator) {
        case 'equals':
          target[field] = { equals: value };
          break;
        case 'contains':
          target[field] = { contains: value };
          break;
        case 'startsWith':
          target[field] = { startsWith: value };
          break;
        case 'endsWith':
          target[field] = { endsWith: value };
          break;
        case 'gt':
          target[field] = { gt: value };
          break;
        case 'gte':
          target[field] = { gte: value };
          break;
        case 'lt':
          target[field] = { lt: value };
          break;
        case 'lte':
          target[field] = { lte: value };
          break;
        case 'in':
          target[field] = { in: Array.isArray(value) ? value : [value] };
          break;
        case 'notIn':
          target[field] = { notIn: Array.isArray(value) ? value : [value] };
          break;
        case 'between':
          if (Array.isArray(value) && value.length === 2) {
            target[field] = {
              gte: value[0],
              lte: value[1],
            };
          }
          break;
        case 'isNull':
          target[field] = { equals: null };
          break;
        case 'isNotNull':
          target[field] = { not: { equals: null } };
          break;
        default:
          target[field] = value;
      }
    }
    // For nested fields (e.g., 'user.profile.firstName')
    else {
      const firstField = fieldParts[0];
      const remainingFields = fieldParts.slice(1).join('.');

      if (!target[firstField]) {
        target[firstField] = {};
      }

      this.applyCondition(target[firstField], remainingFields, operator, value);
    }
  }
}

/**
 * Server Action integration with Filter Builder
 */

// Server action to get products with filter
//   export async function getAllProductsWithFilter(formData: FormData): Promise<ActionResult<any>> {
//     try {
//       // Parse filter from form data
//       const filterJson = formData.get('filter') as string;
//       let filterObject = {};

//       if (filterJson) {
//         try {
//           filterObject = JSON.parse(filterJson);
//         } catch (e) {
//           return {
//             success: false,
//             errors: [{ field: 'filter', message: 'Invalid filter format' }]
//           };
//         }
//       }

//       // You could also build the filter here from raw form data
//       // Example:
//       /*
//       const search = formData.get('search') as string;
//       const minPrice = formData.get('minPrice') ? Number(formData.get('minPrice')) : null;
//       const maxPrice = formData.get('maxPrice') ? Number(formData.get('maxPrice')) : null;
//       const category = formData.get('category') as string;

//       const filterBuilder = new FilterBuilder();

//       if (search) {
//         filterBuilder.where('name', 'contains', search);
//       }

//       if (minPrice !== null && maxPrice !== null) {
//         filterBuilder.where('price', 'between', [minPrice, maxPrice]);
//       }

//       const filterObject = filterBuilder.build();
//       */

//       // Get the service
//       const productService = new ProductService();

//       // Extract pagination info
//       const page = filterObject.skip ? Math.floor(filterObject.skip / filterObject.take) + 1 : 1;
//       const pageSize = filterObject.take || 10;

//       // Use your existing service with the filter
//       // This will ultimately use your mergeFilters method
//       const results = await productService.findAllPaginated(page, pageSize, filterObject);

//       return { success: true, data: results };
//     } catch (error) {
//       console.error('Error fetching products:', error);
//       return {
//         success: false,
//         errors: [{ field: 'general', message: 'Failed to fetch products' }]
//       };
//     }
//   }
