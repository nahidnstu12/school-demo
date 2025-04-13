import { FilterConfig } from './filter-helpers';

// Define filter configuration for the useDynamicFilters hook
export const filterConfig: FilterConfig = {
  fields: {
    name: { type: 'string', defaultOperator: 'contains', urlParam: 'search' },
    category: { type: 'string', defaultOperator: 'equals' },
    price: { type: 'number' },
    tag: { type: 'string', defaultOperator: 'contains', urlParam: 'tag' },
    stock: { type: 'number' },
    featured: { type: 'boolean' },
  },
  defaultPageSize: 12,
  defaultSort: { field: 'createdAt', direction: 'desc' as const },
};
