import {
  AdvancedFilters,
  FilterConfig,
  FilterOperator,
  FilterState,
  FilterUrlUtils,
  SimpleFilter,
} from '@/utils/filter-helpers';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Custom hook for dynamic URL filtering with synchronous URL updates
 */
export function useDynamicFilters(config: FilterConfig) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use refs to prevent infinite loops
  const isUpdatingFromUrl = useRef(false);
  const initialUrlParseComplete = useRef(false);
  const lastAppliedUrl = useRef<string | null>(null);

  // State for current filter (managed by form but not yet applied)
  const [filterState, setFilterState] = useState<FilterState>({
    filters: [],
    page: 1,
    pageSize: config.defaultPageSize || 12,
    sort: config.defaultSort ? [config.defaultSort] : [],
  });

  // State for applied filter (will be used for API calls)
  const [appliedFilterState, setAppliedFilterState] = useState<FilterState>(filterState);

  // Generate Prisma-compatible filter object from current applied state
  const [prismaFilter, setPrismaFilter] = useState({});

  /**
   * Parse filter state from URL
   */
  const parseFiltersFromUrl = useCallback(() => {
    // Start with default values
    const newFilterState: FilterState = {
      filters: [],
      page: 1,
      pageSize: config.defaultPageSize || 10,
    };

    // Parse pagination
    newFilterState.page = Number(searchParams.get('page') || 1);
    newFilterState.pageSize = Number(searchParams.get('pageSize') || config.defaultPageSize || 10);

    // Parse sorting
    const sortField = searchParams.get('sort');
    const sortDir = searchParams.get('dir') as 'asc' | 'desc';

    if (sortField) {
      newFilterState.sort = [{ field: sortField, direction: sortDir || 'asc' }];
    } else if (config.defaultSort) {
      newFilterState.sort = [config.defaultSort];
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

        const { field, operator } = FilterUrlUtils.parseFieldParam(param);

        // If this param is for our current field
        if (field === urlParam && value) {
          // Parse the value according to field type
          const parsedValue = FilterUrlUtils.parseValue(value, fieldConfig.type);

          // Add to simple filters
          simpleFilters.push({
            field: fieldName, // Use the actual field name, not URL param
            operator: operator || fieldConfig.defaultOperator || 'equals',
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
          simpleFilters.push({
            field: fieldName,
            operator: 'between',
            value: [
              FilterUrlUtils.parseValue(minValue, fieldConfig.type),
              FilterUrlUtils.parseValue(maxValue, fieldConfig.type),
            ],
          });
        } else if (minValue) {
          // Just min - use gte
          simpleFilters.push({
            field: fieldName,
            operator: 'gte',
            value: FilterUrlUtils.parseValue(minValue, fieldConfig.type),
          });
        } else if (maxValue) {
          // Just max - use lte
          simpleFilters.push({
            field: fieldName,
            operator: 'lte',
            value: FilterUrlUtils.parseValue(maxValue, fieldConfig.type),
          });
        }
      }
    });

    newFilterState.filters = simpleFilters;

    // Parse advanced filters
    const advancedFiltersParam = searchParams.get('advanced');
    if (advancedFiltersParam) {
      try {
        newFilterState.advancedFilters = JSON.parse(advancedFiltersParam);
      } catch (e) {
        console.error('Failed to parse advanced filters', e);
      }
    }

    return newFilterState;
  }, [searchParams, config]);

  /**
   * Update URL with current filter state
   * @returns The URL string that was set
   */
  const updateUrl = useCallback(
    (state: FilterState): string => {
      // Skip if we're currently updating from URL to prevent loops

      if (isUpdatingFromUrl.current) return '';

      const params = new URLSearchParams();
      console.log('params>>', params, state);

      // Add pagination
      if (state.page > 1) {
        params.set('page', state.page.toString());
      }

      if (state.pageSize) {
        params.set('pageSize', state.pageSize.toString());
      }

      // Add sorting
      if (state.sort && state.sort.length > 0) {
        const [firstSort] = state.sort;
        params.set('sort', firstSort.field);
        params.set('dir', firstSort.direction);
      }

      // Add simple filters
      state.filters.forEach((filter) => {
        const fieldConfig = config.fields[filter.field];
        if (!fieldConfig) return;

        const urlParam = fieldConfig.urlParam || filter.field;

        // Handle range filters (between, gte, lte)
        if (filter.operator === 'between' && Array.isArray(filter.value)) {
          const [min, max] = filter.value;
          params.set(`${urlParam}Min`, FilterUrlUtils.formatValue(min, fieldConfig.type));
          params.set(`${urlParam}Max`, FilterUrlUtils.formatValue(max, fieldConfig.type));
        } else if (filter.operator === 'gte') {
          params.set(`${urlParam}Min`, FilterUrlUtils.formatValue(filter.value, fieldConfig.type));
        } else if (filter.operator === 'lte') {
          params.set(`${urlParam}Max`, FilterUrlUtils.formatValue(filter.value, fieldConfig.type));
        } else {
          // For other operators, use field:operator format
          const isDefaultOp = filter.operator === (fieldConfig.defaultOperator || 'equals');
          const paramName = isDefaultOp
            ? urlParam
            : FilterUrlUtils.formatFieldParam(urlParam, filter.operator);

          params.set(paramName, FilterUrlUtils.formatValue(filter.value, fieldConfig.type));
        }
      });

      // Add advanced filters
      if (state.advancedFilters && Object.keys(state.advancedFilters).length > 0) {
        params.set('advanced', JSON.stringify(state.advancedFilters));
      }

      // Construct the URL string
      const urlString = params.toString();

      // Update URL
      router.push(`?${urlString}`, { scroll: false });
      
      console.log('urlString>>', urlString);
      // Return the URL for potential synchronous usage
      return urlString;
    },
    [router, config]
  );

  /**
   * Convert filter state to Prisma query
   */
  const buildPrismaFilter = useCallback((state: FilterState) => {
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
          AND: state.advancedFilters.AND.map(buildSimpleFilterCondition).filter(Boolean),
        });
      }

      if (state.advancedFilters.OR?.length) {
        whereConditions.push({
          OR: state.advancedFilters.OR.map(buildSimpleFilterCondition).filter(Boolean),
        });
      }

      if (state.advancedFilters.NOT?.length) {
        whereConditions.push({
          NOT: state.advancedFilters.NOT.map(buildSimpleFilterCondition).filter(Boolean),
        });
      }
    }

    // Add where clause if we have conditions
    if (whereConditions.length > 0) {
      result.where = whereConditions.length === 1 ? whereConditions[0] : { AND: whereConditions };
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
  }, []);

  /**
   * Helper function to build a prisma condition from a simple filter
   */
  const buildSimpleFilterCondition = (filter: SimpleFilter) => {
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
            AND: [{ [field]: { gte: value[0] } }, { [field]: { lte: value[1] } }],
          };
        }
        return null;
      default:
        return { [field]: value };
    }
  };

  // Initialize from URL on mount - only once
  useEffect(() => {
    if (!initialUrlParseComplete.current) {
      initialUrlParseComplete.current = true;
      isUpdatingFromUrl.current = true;

      try {
        const newState = parseFiltersFromUrl();
        setFilterState(newState);
        setAppliedFilterState(newState);

        const newPrismaFilter = buildPrismaFilter(newState);
        setPrismaFilter(newPrismaFilter);
      } catch (error) {
        console.error('Error parsing URL filters:', error);
      } finally {
        isUpdatingFromUrl.current = false;
      }
    }
  }, [parseFiltersFromUrl, buildPrismaFilter]);

  // Filter manipulation functions - these update the form state but don't apply yet
  const updateFilterState = useCallback((field: string, operator: FilterOperator, value: any) => {
    setFilterState((prev) => {
      // Remove any existing filter for this field
      const existingFilters = prev.filters.filter((f) => f.field !== field);

      // Add the new filter
      const newFilters = [...existingFilters];

      // Only add if value is not empty
      if (value !== undefined && value !== null && value !== '') {
        newFilters.push({ field, operator, value });
      }

      // Return new state without updating URL or prismaFilter yet
      return {
        ...prev,
        filters: newFilters,
      };
    });
  }, []);

  const updateRangeFilter = useCallback(
    (field: string, min?: any, max?: any) => {
      if (
        (min === undefined || min === null || min === '') &&
        (max === undefined || max === null || max === '')
      ) {
        // If both values are empty, remove the filter
        setFilterState((prev) => {
          const newFilters = prev.filters.filter((f) => f.field !== field);
          return {
            ...prev,
            filters: newFilters,
          };
        });
        return;
      }

      if (
        min !== undefined &&
        min !== null &&
        min !== '' &&
        max !== undefined &&
        max !== null &&
        max !== ''
      ) {
        // Both values - use between
        updateFilterState(field, 'between', [min, max]);
      } else if (min !== undefined && min !== null && min !== '') {
        // Just min - use gte
        updateFilterState(field, 'gte', min);
      } else if (max !== undefined && max !== null && max !== '') {
        // Just max - use lte
        updateFilterState(field, 'lte', max);
      }
    },
    [updateFilterState]
  );

  // Apply the current filter state - this triggers URL update and data fetch
  const applyFilters = useCallback(() => {
    // Create a new state based on current filter state (reset to page 1)
    const newState = { ...filterState, page: 1 };

    // IMPORTANT: Update URL FIRST
    updateUrl(newState);

    // Then update local state
    setFilterState(newState);

    // Wait for the next tick to ensure URL update has been processed
    setTimeout(() => {
      setAppliedFilterState(newState);

      // Update prisma filter
      const newPrismaFilter = buildPrismaFilter(newState);
      setPrismaFilter(newPrismaFilter);
    }, 0);
  }, [filterState, updateUrl, buildPrismaFilter]);

  // Apply just pagination changes without changing filters
  const updatePage = useCallback(
    (newPage: number) => {
      const newState = {
        ...appliedFilterState,
        page: newPage,
      };

      // UPDATE URL FIRST - this is the key change
      updateUrl(newState);

      // Then update state
      setFilterState((prev) => ({
        ...prev,
        page: newPage,
      }));

      setAppliedFilterState((prev) => {
        const updatedState = {
          ...prev,
          page: newPage,
        };

        // Update prisma filter
        const newPrismaFilter = buildPrismaFilter(updatedState);
        setPrismaFilter(newPrismaFilter);

        return updatedState;
      });
    },
    [appliedFilterState, updateUrl, buildPrismaFilter]
  );

  // Apply just page size changes without changing filters
  // const updatePageSize = useCallback(
  //   (newPageSize: number) => {
  //     console.log('New page size:', newPageSize);

  //     const newState = {
  //       ...appliedFilterState,
  //       pageSize: newPageSize,
  //       page: 1, // Reset to page 1 when changing page size
  //     };

  //     // UPDATE URL FIRST before updating state
  //     updateUrl(newState);

  //     // Then update state
  //     setFilterState((prev) => ({
  //       ...prev,
  //       pageSize: newPageSize,
  //       page: 1,
  //     }));

  //     setAppliedFilterState((prev) => {
  //       const updatedState = {
  //         ...prev,
  //         pageSize: newPageSize,
  //         page: 1,
  //       };

  //       // Update prisma filter AFTER URL is updated
  //       const newPrismaFilter = buildPrismaFilter(updatedState);
  //       setPrismaFilter(newPrismaFilter);

  //       return updatedState;
  //     });
  //   },
  //   [appliedFilterState, updateUrl, buildPrismaFilter]
  // );

  // Function to properly update page size in useDynamicFilters hook
  // This should replace the existing updatePageSize function

  const updatePageSize = useCallback(
    (newPageSize: number) => {
      console.log('New page size:', newPageSize);

      // Create a frozen copy of the current state to avoid race conditions
      const newState = {
        ...appliedFilterState,
        pageSize: newPageSize,
        page: 1, // Reset to page 1 when changing page size
      };

      // Flag to track if we're in the middle of a page size update
      let isPageSizeUpdate = true;

      try {
        // Update the URL directly with the specific parameters we want to change
        const url = new URL(window.location.href);
        url.searchParams.set('pageSize', newPageSize.toString());
        url.searchParams.set('page', '1');

        // Remember the new URL to prevent duplicate fetches
        lastAppliedUrl.current = url.search;

        // Update browser URL without triggering navigation
        window.history.pushState({}, '', url.toString());

        // Update filter state (this should be synchronized with our direct URL change)
        setFilterState({
          ...newState,
        });

        // Set applied state directly
        setAppliedFilterState(newState);

        // Update prisma filter immediately with the new state
        const newPrismaFilter = buildPrismaFilter(newState);
        setPrismaFilter(newPrismaFilter);

        // Trigger a data fetch directly
        // setTimeout(() => {
        //   if (isPageSizeUpdate) {
        //     // This will use our updated prismaFilter
        //     const formData = new FormData();
        //     formData.append('filter', JSON.stringify(newPrismaFilter));
        //     fetchData(formData); // Assuming fetchData is accessible here
        //   }
        // }, 50);
      } catch (error) {
        console.error('Error updating page size:', error);
      } finally {
        // Clear the flag after all operations complete
        setTimeout(() => {
          isPageSizeUpdate = false;
        }, 200);
      }
    },
    [appliedFilterState, buildPrismaFilter, setFilterState, setAppliedFilterState]
  );

  // Apply just sort changes without changing filters
  const updateSort = useCallback(
    (field: string, direction: 'asc' | 'desc' = 'asc') => {
      const newState = {
        ...appliedFilterState,
        sort: [{ field, direction }],
      };

      // UPDATE URL FIRST
      updateUrl(newState);

      // Then update state
      setFilterState((prev) => ({
        ...prev,
        sort: [{ field, direction }],
      }));

      setAppliedFilterState((prev) => {
        const updatedState = {
          ...prev,
          sort: [{ field, direction }],
        };

        // Update prisma filter
        const newPrismaFilter = buildPrismaFilter(updatedState);
        setPrismaFilter(newPrismaFilter);

        return updatedState;
      });
    },
    [appliedFilterState, updateUrl, buildPrismaFilter]
  );

  const clearAllFilters = useCallback(() => {
    const newState: FilterState = {
      filters: [],
      page: 1,
      pageSize: config.defaultPageSize || 10,
      sort: config.defaultSort ? [config.defaultSort] : [],
    };

    // UPDATE URL FIRST
    updateUrl(newState);

    // Update both states
    setFilterState(newState);
    setAppliedFilterState(newState);

    // Update prisma filter
    const newPrismaFilter = buildPrismaFilter(newState);
    setPrismaFilter(newPrismaFilter);
  }, [config, updateUrl, buildPrismaFilter]);

  // Listen for URL changes that happen outside of our control
  useEffect(() => {
    // Skip the first render and our own updates
    if (isUpdatingFromUrl.current) return;

    // Get the current URL search params as a string
    const currentParams = searchParams.toString();

    // If it's different from our last applied URL, update our state
    if (currentParams !== lastAppliedUrl.current) {
      isUpdatingFromUrl.current = true;
      try {
        const newState = parseFiltersFromUrl();
        setFilterState(newState);
        setAppliedFilterState(newState);

        const newPrismaFilter = buildPrismaFilter(newState);
        setPrismaFilter(newPrismaFilter);

        // Remember this URL
        lastAppliedUrl.current = currentParams;
      } finally {
        isUpdatingFromUrl.current = false;
      }
    }
  }, [searchParams, parseFiltersFromUrl, buildPrismaFilter]);

  // Get active filter value for form controls
  const getFilterValue = useCallback(
    (field: string) => {
      const filter = filterState.filters.find((f) => f.field === field);
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
    [filterState.filters]
  );

  return {
    // Current form state (not yet applied)
    filters: filterState.filters,
    advancedFilters: filterState.advancedFilters,
    sort: filterState.sort,
    page: appliedFilterState.page, // Use applied state for pagination
    pageSize: appliedFilterState.pageSize, // Use applied state for pagination

    // Generated Prisma filter
    prismaFilter,

    // Form state manipulation methods (doesn't update URL)
    setFilter: updateFilterState,
    setRangeFilter: updateRangeFilter,

    // Applied state methods (updates URL and triggers data fetch)
    applyFilters,
    setPage: updatePage,
    setPageSize: updatePageSize,
    setSort: updateSort,
    clearAllFilters,

    // Helper methods
    getFilterValue,

    // For debug
    filterState,
    appliedFilterState,
  };
}
