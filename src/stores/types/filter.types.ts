// import { FilterConfig, FilterOperator } from '@/utils/filter-helpers';

import { FilterConfig, FilterOperator, FilterState } from "@/utils/filter-helpers";

// export interface SimpleFilter {
//   field: string;
//   operator: FilterOperator;
//   value: any;
// }

// export interface AdvancedFilters {
//   AND?: SimpleFilter[];
//   OR?: SimpleFilter[];
//   NOT?: SimpleFilter[];
// }

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}


// export interface FilterState {
//   // Filter state
//   filters: SimpleFilter[];
//   advancedFilters?: AdvancedFilters;
//   page: number;
//   pageSize: number;
//   sort: SortConfig[];
//   config: FilterConfig | null;
  
//   // UI state
//   isSubmitting: boolean;
//   lastFetchUrl: string;
//   appliedFiltersCount: number;
// }

export interface FilterActions {
  setFilter: (field: string, operator: FilterOperator, value: any) => void;
  setRangeFilter: (field: string, min: any, max: any) => void;
  applyFilters: () => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSort: (field: string, direction: 'asc' | 'desc') => void;
  clearAllFilters: () => void;
  setConfig: (config: FilterConfig) => void;
  parseFromUrl: (searchParams: URLSearchParams) => void;
  getPrismaFilter: () => any;
  getFilterValue: (field: string) => any;
  calculateAppliedFiltersCount: () => void;
}

export type FilterStore = FilterState & FilterActions; 