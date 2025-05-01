// src/stores/useFilterStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AdvancedFilters, FilterConfig, FilterOperator, SimpleFilter } from '@/utils/filter-helpers';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// Add Next.js window type
declare global {
  interface Window {
    next?: {
      router?: any;
    };
  }
}

// Define filter state structure
interface FilterState {
  // Filter state
  filters: SimpleFilter[];
  advancedFilters?: AdvancedFilters;
  page: number;
  pageSize: number;
  sort: { field: string; direction: 'asc' | 'desc' }[];
  config: FilterConfig | null;
  
  // UI state
  isSubmitting: boolean;
  lastFetchUrl: string;
  appliedFiltersCount: number;
  
  // Actions
  setFilter: (field: string, operator: FilterOperator, value: any) => void;
  setRangeFilter: (field: string, min: any, max: any) => void;
  applyFilters: () => void;
  setPage: (page: number) => void; 
  setPageSize: (size: number) => void;
  setSort: (field: string, direction: 'asc' | 'desc') => void;
  clearAllFilters: () => void;
  setConfig: (config: FilterConfig) => void;
  
  // URL functionality
  parseFromUrl: (searchParams: URLSearchParams) => void;
  
  // Derived state
  getPrismaFilter: () => any;
  getFilterValue: (field: string) => any;
  calculateAppliedFiltersCount: () => void;
}

// Create Zustand store with persist middleware
export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      // Initial state
      filters: [],
      advancedFilters: undefined,
      page: 1,
      pageSize: 10,
      sort: [],
      config: null,
      isSubmitting: false,
      lastFetchUrl: '',
      appliedFiltersCount: 0,
      
      // Set a single filter
      setFilter: (field, operator, value) => {
        set(state => {
          // Remove any existing filter for this field
          const existingFilters = state.filters.filter(f => f.field !== field);
          
          // Only add if value is not empty
          if (value !== undefined && value !== null && value !== '') {
            return {
              ...state,
              filters: [...existingFilters, { field, operator, value }]
            };
          }
          
          return {
            ...state,
            filters: existingFilters
          };
        });
      },
      
      // Set range filter (date ranges, numeric ranges)
      setRangeFilter: (field, min, max) => {
        if (
          (min === undefined || min === null || min === '') &&
          (max === undefined || max === null || max === '')
        ) {
          // If both values are empty, remove the filter
          set(state => ({
            ...state,
            filters: state.filters.filter(f => f.field !== field)
          }));
          return;
        }

        if (
          min !== undefined && min !== null && min !== '' &&
          max !== undefined && max !== null && max !== ''
        ) {
          // Both values - use between
          get().setFilter(field, 'between', [min, max]);
        } else if (min !== undefined && min !== null && min !== '') {
          // Just min - use gte
          get().setFilter(field, 'gte', min);
        } else if (max !== undefined && max !== null && max !== '') {
          // Just max - use lte
          get().setFilter(field, 'lte', max);
        }
      },
      
      // Apply filters to URL and trigger data fetch
      applyFilters: () => {
        // Set submitting flag to prevent double fetches
        set({ isSubmitting: true, page: 1 });
        
        // Update URL with current filter state
        const router = globalThis.window ? globalThis.window.next?.router : undefined;
        if (router) {
          const params = new URLSearchParams();
          
          // Add pagination
          if (get().page > 1) {
            params.set('page', get().page.toString());
          }
          
          params.set('pageSize', get().pageSize.toString());
          
          // Add sorting
          if (get().sort.length > 0) {
            const [firstSort] = get().sort;
            params.set('sort', firstSort.field);
            params.set('dir', firstSort.direction);
          }
          
          // Add filters
          get().filters.forEach(filter => {
            const fieldConfig = get().config?.fields[filter.field];
            if (!fieldConfig) return;
            
            const urlParam = fieldConfig.urlParam || filter.field;
            
            // Handle range filters (between, gte, lte)
            if (filter.operator === 'between' && Array.isArray(filter.value)) {
              const [min, max] = filter.value;
              if (min) params.set(`${urlParam}Min`, String(min));
              if (max) params.set(`${urlParam}Max`, String(max));
            } else if (filter.operator === 'gte') {
              params.set(`${urlParam}Min`, String(filter.value));
            } else if (filter.operator === 'lte') {
              params.set(`${urlParam}Max`, String(filter.value));
            } else {
              // For other operators
              const isDefaultOp = filter.operator === (fieldConfig.defaultOperator || 'equals');
              const paramName = isDefaultOp
                ? urlParam
                : `${urlParam}:${filter.operator}`;
                
              params.set(paramName, String(filter.value));
            }
          });
          
          // Add advanced filters if any
          const advancedFilters = get().advancedFilters;
          if (advancedFilters && typeof advancedFilters === 'object' && Object.keys(advancedFilters).length > 0) {
            params.set('advanced', JSON.stringify(advancedFilters));
          }
          
          // Update URL
          const queryString = params.toString();
          const newUrl = `${window.location.pathname}?${queryString}`;
          
          // Update URL without reloading the page
          window.history.pushState({ path: newUrl }, '', newUrl);
          set({ lastFetchUrl: queryString });
        }
        
        // Reset submitting flag after a delay
        setTimeout(() => {
          set({ isSubmitting: false });
        }, 500);
        
        // Update filter count
        get().calculateAppliedFiltersCount();
      },
      
      // Set current page
      setPage: (page) => {
        set({ isSubmitting: true, page });
        
        // Update URL
        const router = globalThis.window ? globalThis.window.next?.router : undefined;
        if (router) {
          const params = new URLSearchParams(window.location.search);
          params.set('page', page.toString());
          
          const queryString = params.toString();
          const newUrl = `${window.location.pathname}?${queryString}`;
          
          window.history.pushState({ path: newUrl }, '', newUrl);
          set({ lastFetchUrl: queryString });
        }
        
        // Reset submitting flag after a delay
        setTimeout(() => {
          set({ isSubmitting: false });
        }, 500);
      },
      
      // Set page size
      setPageSize: (pageSize) => {
        set({ isSubmitting: true, pageSize, page: 1 });
        
        // Update URL
        const router = globalThis.window ? globalThis.window.next?.router : undefined;
        if (router) {
          const params = new URLSearchParams(window.location.search);
          params.set('pageSize', pageSize.toString());
          params.set('page', '1');
          
          const queryString = params.toString();
          const newUrl = `${window.location.pathname}?${queryString}`;
          
          window.history.pushState({ path: newUrl }, '', newUrl);
          set({ lastFetchUrl: queryString });
        }
        
        // Reset submitting flag after a delay
        setTimeout(() => {
          set({ isSubmitting: false });
        }, 500);
      },
      
      // Set sort field and direction
      setSort: (field, direction) => {
        set({ 
          isSubmitting: true,
          sort: [{ field, direction }] 
        });
        
        // Update URL
        const router = globalThis.window ? globalThis.window.next?.router : undefined;
        if (router) {
          const params = new URLSearchParams(window.location.search);
          params.set('sort', field);
          params.set('dir', direction);
          
          const queryString = params.toString();
          const newUrl = `${window.location.pathname}?${queryString}`;
          
          window.history.pushState({ path: newUrl }, '', newUrl);
          set({ lastFetchUrl: queryString });
        }
        
        // Reset submitting flag after a delay
        setTimeout(() => {
          set({ isSubmitting: false });
        }, 500);
      },
      
      // Clear all filters
      clearAllFilters: () => {
        const config = get().config;
        
        set({ 
          isSubmitting: true,
          filters: [],
          advancedFilters: undefined,
          page: 1,
          pageSize: config?.defaultPageSize || 10,
          sort: config?.defaultSort ? [config.defaultSort] : [],
        });
        
        // Update URL
        const router = globalThis.window ? globalThis.window.next?.router : undefined;
        if (router) {
          const params = new URLSearchParams();
          if (config?.defaultSort) {
            params.set('sort', config.defaultSort.field);
            params.set('dir', config.defaultSort.direction);
          }
          params.set('pageSize', String(config?.defaultPageSize || 10));
          
          const queryString = params.toString();
          const newUrl = `${window.location.pathname}?${queryString}`;
          
          window.history.pushState({ path: newUrl }, '', newUrl);
          set({ lastFetchUrl: queryString });
        }
        
        // Reset submitting flag and filter count
        setTimeout(() => {
          set({ isSubmitting: false, appliedFiltersCount: 0 });
        }, 500);
      },
      
      // Set filter configuration
      setConfig: (config) => {
        set({ config });
        
        // Initialize with default sort if provided
        if (config.defaultSort) {
          set(state => ({
            ...state,
            sort: state.sort.length > 0 ? state.sort : [config.defaultSort]
          }));
        }
        
        // Initialize with default page size
        if (config.defaultPageSize) {
          set(state => ({
            ...state,
            pageSize: state.pageSize || config.defaultPageSize
          }));
        }
      },
      
      // Parse filter state from URL
      parseFromUrl: (searchParams) => {
        const config = get().config;
        if (!config) return;
        
        const newState: Partial<FilterState> = {
          filters: [],
          page: Number(searchParams.get('page') || 1),
          pageSize: Number(searchParams.get('pageSize') || config.defaultPageSize || 10),
        };
        
        // Parse sorting
        const sortField = searchParams.get('sort');
        const sortDir = searchParams.get('dir') as 'asc' | 'desc';
        
        if (sortField) {
          newState.sort = [{ field: sortField, direction: sortDir || 'asc' }];
        } else if (config.defaultSort) {
          newState.sort = [config.defaultSort];
        }
        
        // Parse simple filters
        const simpleFilters: SimpleFilter[] = [];
        
        // Iterate through all the configured fields
        Object.entries(config.fields).forEach(([fieldName, fieldConfig]) => {
          // Get the URL parameter name for this field
          const urlParam = fieldConfig.urlParam || fieldName;
          
          // Check for field:operator format params
          for (const [param, value] of searchParams.entries()) {
            // Skip non-field params
            if (['page', 'pageSize', 'sort', 'dir', 'advanced'].includes(param)) {
              continue;
            }
            
            // Parse field and operator from param name
            let field = param;
            let operator: FilterOperator = fieldConfig.defaultOperator || 'equals';
            
            if (param.includes(':')) {
              const parts = param.split(':');
              field = parts[0];
              operator = parts[1] as FilterOperator;
            }
            
            // If this param is for our current field
            if (field === urlParam && value) {
              // Parse the value according to field type
              let parsedValue: any = value;
              
              // Type conversion based on field type
              if (fieldConfig.type === 'number') {
                parsedValue = Number(value);
              } else if (fieldConfig.type === 'boolean') {
                parsedValue = value === 'true';
              } else if (fieldConfig.type === 'date') {
                parsedValue = new Date(value);
              }
              
              // Add to simple filters
              simpleFilters.push({
                field: fieldName, // Use the actual field name, not URL param
                operator,
                value: parsedValue,
              });
            }
          }
          
          // Check for special between operator (range fields)
          const minParam = `${urlParam}Min`;
          const maxParam = `${urlParam}Max`;
          
          if (searchParams.has(minParam) || searchParams.has(maxParam)) {
            const minValue = searchParams.get(minParam);
            const maxValue = searchParams.get(maxParam);
            
            if (minValue && maxValue) {
              // Both min and max - use between
              let parsedMin: any = minValue;
              let parsedMax: any = maxValue;
              
              // Type conversion
              if (fieldConfig.type === 'number') {
                parsedMin = Number(minValue);
                parsedMax = Number(maxValue);
              } else if (fieldConfig.type === 'date') {
                parsedMin = new Date(minValue);
                parsedMax = new Date(maxValue);
              }
              
              simpleFilters.push({
                field: fieldName,
                operator: 'between',
                value: [parsedMin, parsedMax],
              });
            } else if (minValue) {
              // Just min - use gte
              let parsedMin: any = minValue;
              
              if (fieldConfig.type === 'number') {
                parsedMin = Number(minValue);
              } else if (fieldConfig.type === 'date') {
                parsedMin = new Date(minValue);
              }
              
              simpleFilters.push({
                field: fieldName,
                operator: 'gte',
                value: parsedMin,
              });
            } else if (maxValue) {
              // Just max - use lte
              let parsedMax: any = maxValue;
              
              if (fieldConfig.type === 'number') {
                parsedMax = Number(maxValue);
              } else if (fieldConfig.type === 'date') {
                parsedMax = new Date(maxValue);
              }
              
              simpleFilters.push({
                field: fieldName,
                operator: 'lte',
                value: parsedMax,
              });
            }
          }
        });
        
        newState.filters = simpleFilters;
        
        // Parse advanced filters
        const advancedFiltersParam = searchParams.get('advanced');
        if (advancedFiltersParam) {
          try {
            newState.advancedFilters = JSON.parse(advancedFiltersParam);
          } catch (e) {
            console.error('Failed to parse advanced filters', e);
          }
        }
        
        // Update state with values from URL
        set(newState as FilterState);
        
        // Update filter count
        get().calculateAppliedFiltersCount();
      },
      
      // Convert filter state to Prisma filter
      getPrismaFilter: () => {
        const state = get();
        const result: any = {};
        
        // Build where clause
        const whereConditions: any[] = [];
        
        // Process simple filters
        state.filters.forEach((filter) => {
          const condition = buildSimpleFilterCondition(filter);
          if (condition) {
            whereConditions.push(condition);
          }
        });
        
        // Process advanced filters
        if (state.advancedFilters) {
          if (state.advancedFilters.AND?.length) {
            whereConditions.push({
              AND: state.advancedFilters.AND
                .map(buildSimpleFilterCondition)
                .filter(Boolean),
            });
          }
          
          if (state.advancedFilters.OR?.length) {
            whereConditions.push({
              OR: state.advancedFilters.OR
                .map(buildSimpleFilterCondition)
                .filter(Boolean),
            });
          }
          
          if (state.advancedFilters.NOT?.length) {
            whereConditions.push({
              NOT: state.advancedFilters.NOT
                .map(buildSimpleFilterCondition)
                .filter(Boolean),
            });
          }
        }
        
        // Add where clause if we have conditions
        if (whereConditions.length > 0) {
          result.where = whereConditions.length === 1 
            ? whereConditions[0] 
            : { AND: whereConditions };
        }
        
        // Add sorting
        if (state.sort && state.sort.length > 0) {
          if (state.sort.length === 1) {
            const { field, direction } = state.sort[0];
            result.orderBy = { [field]: direction };
          } else {
            result.orderBy = state.sort.map(({ field, direction }) => ({
              [field]: direction,
            }));
          }
        }
        
        // Add pagination
        result.skip = (state.page - 1) * state.pageSize;
        result.take = state.pageSize;
        
        return result;
      },
      
      // Get a filter value by field name
      getFilterValue: (field) => {
        const filter = get().filters.find(f => f.field === field);
        if (!filter) return undefined;
        
        if (filter.operator === 'between' && Array.isArray(filter.value)) {
          return { min: filter.value[0], max: filter.value[1] };
        } else if (filter.operator === 'gte' || filter.operator === 'gt') {
          return { min: filter.value };
        } else if (filter.operator === 'lte' || filter.operator === 'lt') {
          return { max: filter.value };
        }
        
        return filter.value;
      },
      
      // Calculate the number of applied filters
      calculateAppliedFiltersCount: () => {
        const state = get();
        let count = 0;
        
        // Count active filters
        Object.keys(state.config?.fields || {}).forEach(key => {
          const value = state.getFilterValue(key);
          if (value) {
            if (typeof value === 'object' && (value.min || value.max)) {
              count++;
            } else if (value !== '') {
              count++;
            }
          }
        });
        
        // Count search as a filter if present
        if (state.getFilterValue('search')) {
          count++;
        }
        
        set({ appliedFiltersCount: count });
      }
    }),
    {
      name: 'filter-storage',
      partialize: (state) => ({ 
        // Only persist these values
        pageSize: state.pageSize,
        // Don't persist filters or other state
      }),
    }
  )
);

// Helper function to build a Prisma condition from a simple filter
function buildSimpleFilterCondition(filter: SimpleFilter) {
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

// Hook to sync URL with filter store
export function useSyncUrlWithFilterStore(config: FilterConfig) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const setConfig = useFilterStore(state => state.setConfig);
  const parseFromUrl = useFilterStore(state => state.parseFromUrl);
  
  // Set config once
  useEffect(() => {
    setConfig(config);
  }, [config, setConfig]);
  
  // Sync from URL when it changes
  useEffect(() => {
    parseFromUrl(searchParams as unknown as URLSearchParams);
  }, [searchParams, parseFromUrl]);
  
  return null;
}