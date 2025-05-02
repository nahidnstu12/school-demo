import { FilterOperator, SimpleFilter } from '@/utils/filter-helpers';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FilterStore, SortConfig } from './types/filter.types';
import { buildSimpleFilterCondition, buildUrlParams, parseFilterValue, updateUrlWithoutReload } from './utils/filter.utils';

// Add Next.js window type
declare global {
  interface Window {
    next?: {
      router?: any;
    };
  }
}

// Create Zustand store with persist middleware
export const useFilterStore = create<FilterStore>()(
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
          const existingFilters = state.filters.filter(f => f.field !== field);
          
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
      
      // Set range filter
      setRangeFilter: (field, min, max) => {
        if (
          (min === undefined || min === null || min === '') &&
          (max === undefined || max === null || max === '')
        ) {
          set(state => ({
            ...state,
            filters: state.filters.filter(f => f.field !== field)
          }));
          return;
        }

        if (min && max) {
          get().setFilter(field, 'between', [min, max]);
        } else if (min) {
          get().setFilter(field, 'gte', min);
        } else if (max) {
          get().setFilter(field, 'lte', max);
        }
      },
      
      // Apply filters to URL and trigger data fetch
      applyFilters: () => {
        set({ isSubmitting: true, page: 1 });
        
        const state = get();
        const params = buildUrlParams(state);
        const queryString = updateUrlWithoutReload(params);
        
        set({ lastFetchUrl: queryString });
        
        setTimeout(() => {
          set({ isSubmitting: false });
        }, 500);
        
        get().calculateAppliedFiltersCount();
      },
      
      // Set current page
      setPage: (page) => {
        set({ isSubmitting: true, page });
        
        const params = new URLSearchParams(window.location.search);
        params.set('page', page.toString());
        const queryString = updateUrlWithoutReload(params);
        
        set({ lastFetchUrl: queryString });
        
        setTimeout(() => {
          set({ isSubmitting: false });
        }, 500);
      },
      
      // Set page size
      setPageSize: (pageSize) => {
        set({ isSubmitting: true, pageSize, page: 1 });
        
        const params = new URLSearchParams(window.location.search);
        params.set('pageSize', pageSize.toString());
        params.set('page', '1');
        const queryString = updateUrlWithoutReload(params);
        
        set({ lastFetchUrl: queryString });
        
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
        
        const params = new URLSearchParams(window.location.search);
        params.set('sort', field);
        params.set('dir', direction);
        const queryString = updateUrlWithoutReload(params);
        
        set({ lastFetchUrl: queryString });
        
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
        
        const params = new URLSearchParams();
        if (config?.defaultSort) {
          params.set('sort', config.defaultSort.field);
          params.set('dir', config.defaultSort.direction);
        }
        params.set('pageSize', String(config?.defaultPageSize || 10));
        
        const queryString = updateUrlWithoutReload(params);
        set({ lastFetchUrl: queryString });
        
        setTimeout(() => {
          set({ isSubmitting: false, appliedFiltersCount: 0 });
        }, 500);
      },
      
      // Set filter configuration
      setConfig: (config) => {
        set({ config });
        
        if (config.defaultSort) {
          set(state => ({
            ...state,
            sort: state.sort.length > 0 ? state.sort : [config.defaultSort as SortConfig]
          }));
        }
        
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
        
        const newState: Partial<FilterStore> = {
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
        
        Object.entries(config.fields).forEach(([fieldName, fieldConfig]) => {
          const urlParam = fieldConfig.urlParam || fieldName;
          
          for (const [param, value] of searchParams.entries()) {
            if (['page', 'pageSize', 'sort', 'dir', 'advanced'].includes(param)) {
              continue;
            }
            
            let field = param;
            let operator: FilterOperator = fieldConfig.defaultOperator || 'equals';
            
            if (param.includes(':')) {
              const parts = param.split(':');
              field = parts[0];
              operator = parts[1] as FilterOperator;
            }
            
            if (field === urlParam && value) {
              const parsedValue = parseFilterValue(value, fieldConfig.type);
              
              simpleFilters.push({
                field: fieldName,
                operator,
                value: parsedValue,
              });
            }
          }
          
          // Check for range filters
          const minParam = `${urlParam}Min`;
          const maxParam = `${urlParam}Max`;
          
          if (searchParams.has(minParam) || searchParams.has(maxParam)) {
            const minValue = searchParams.get(minParam);
            const maxValue = searchParams.get(maxParam);
            
            if (minValue && maxValue) {
              simpleFilters.push({
                field: fieldName,
                operator: 'between',
                value: [
                  parseFilterValue(minValue, fieldConfig.type),
                  parseFilterValue(maxValue, fieldConfig.type)
                ],
              });
            } else if (minValue) {
              simpleFilters.push({
                field: fieldName,
                operator: 'gte',
                value: parseFilterValue(minValue, fieldConfig.type),
              });
            } else if (maxValue) {
              simpleFilters.push({
                field: fieldName,
                operator: 'lte',
                value: parseFilterValue(maxValue, fieldConfig.type),
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
        
        set(newState as FilterStore);
        get().calculateAppliedFiltersCount();
      },
      
      // Convert filter state to Prisma filter
      getPrismaFilter: () => {
        const state = get();
        const result: any = {};
        
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
        
        if (whereConditions.length > 0) {
          result.where = whereConditions.length === 1 
            ? whereConditions[0] 
            : { AND: whereConditions };
        }
        
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
        
        if (state.getFilterValue('search')) {
          count++;
        }
        
        set({ appliedFiltersCount: count });
      }
    }),
    {
      name: 'filter-storage',
      partialize: (state) => ({ 
        pageSize: state.pageSize,
      }),
    }
  )
);



