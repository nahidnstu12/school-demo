import { SimpleFilter } from '@/utils/filter-helpers';

export function buildSimpleFilterCondition(filter: SimpleFilter) {
  const { field, operator, value } = filter;
  
  // Skip empty values
  if (value === undefined || value === null || value === '') {
    return null;
  }
  
  switch (operator) {
    case 'equals':
      return { [field]: { equals: value } };
    case 'contains':
      return { [field]: { contains: value } };
    case 'startsWith':
      return { [field]: { startsWith: value } };
    case 'endsWith':
      return { [field]: { endsWith: value } };
    case 'gt':
      return { [field]: { gt: value } };
    case 'gte':
      return { [field]: { gte: value } };
    case 'lt':
      return { [field]: { lt: value } };
    case 'lte':
      return { [field]: { lte: value } };
    case 'in':
      return { [field]: { in: Array.isArray(value) ? value : [value] } };
    case 'between':
      if (Array.isArray(value) && value.length === 2) {
        return {
          AND: [
            { [field]: { gte: value[0] } },
            { [field]: { lte: value[1] } }
          ],
        };
      }
      return null;
    default:
      return { [field]: value };
  }
}

export function parseFilterValue(value: string, type: 'string' | 'number' | 'boolean' | 'date' | 'array'): any {
  switch (type) {
    case 'number':
      return Number(value);
    case 'boolean':
      return value === 'true';
    case 'date':
      return new Date(value);
    case 'array':
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',');
      }
    default:
      return value;
  }
}

export function buildUrlParams(state: {
  page: number;
  pageSize: number;
  sort: { field: string; direction: 'asc' | 'desc' }[];
  filters: SimpleFilter[];
  advancedFilters?: any;
  config: any;
}): URLSearchParams {
  const params = new URLSearchParams();
  
  // Add pagination
  if (state.page > 1) {
    params.set('page', state.page.toString());
  }
  params.set('pageSize', state.pageSize.toString());
  
  // Add sorting
  if (state.sort.length > 0) {
    const [firstSort] = state.sort;
    params.set('sort', firstSort.field);
    params.set('dir', firstSort.direction);
  }
  
  // Add filters
  state.filters.forEach(filter => {
    const fieldConfig = state.config?.fields[filter.field];
    if (!fieldConfig) return;
    
    const urlParam = fieldConfig.urlParam || filter.field;
    
    // Handle range filters
    if (filter.operator === 'between' && Array.isArray(filter.value)) {
      const [min, max] = filter.value;
      if (min) params.set(`${urlParam}Min`, String(min));
      if (max) params.set(`${urlParam}Max`, String(max));
    } else if (filter.operator === 'gte') {
      params.set(`${urlParam}Min`, String(filter.value));
    } else if (filter.operator === 'lte') {
      params.set(`${urlParam}Max`, String(filter.value));
    } else {
      const isDefaultOp = filter.operator === (fieldConfig.defaultOperator || 'equals');
      const paramName = isDefaultOp ? urlParam : `${urlParam}:${filter.operator}`;
      params.set(paramName, String(filter.value));
    }
  });
  
  // Add advanced filters
  if (state.advancedFilters && Object.keys(state.advancedFilters).length > 0) {
    params.set('advanced', JSON.stringify(state.advancedFilters));
  }
  
  return params;
}

export function updateUrlWithoutReload(params: URLSearchParams) {
  const queryString = params.toString();
  const newUrl = `${window.location.pathname}?${queryString}`;
  window.history.pushState({ path: newUrl }, '', newUrl);
  return queryString;
} 