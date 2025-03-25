import {
  AdvancedFilters,
  FilterConfig,
  FilterOperator,
  FilterState,
  FilterUrlUtils,
  SimpleFilter,
} from '@/utils/filter-helpers';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Custom hook for dynamic URL filtering
 */
export function useDynamicFilters(config: FilterConfig) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize empty filter state
  const [filterState, setFilterState] = useState<FilterState>({
    filters: [],
    page: 1,
    pageSize: config.defaultPageSize || 10,
    sort: config.defaultSort ? [config.defaultSort] : [],
  });

  // Generate Prisma-compatible filter object from current state
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
   */
  const updateUrl = useCallback(
    (state: FilterState) => {
      const params = new URLSearchParams();

      // Add pagination
      if (state.page > 1) {
        params.set('page', state.page.toString());
      }

      if (state.pageSize !== (config.defaultPageSize || 10)) {
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

      // Update URL
      router.push(`?${params.toString()}`, { scroll: false });
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

  // Initialize from URL on mount
  useEffect(() => {
    const newState = parseFiltersFromUrl();
    setFilterState(newState);

    // Generate Prisma filter
    const newPrismaFilter = buildPrismaFilter(newState);
    setPrismaFilter(newPrismaFilter);
  }, [searchParams, parseFiltersFromUrl, buildPrismaFilter]);

  // Filter manipulation functions
  const setFilter = useCallback(
    (field: string, operator: FilterOperator, value: any) => {
      setFilterState((prev) => {
        // Remove any existing filter for this field
        const existingFilters = prev.filters.filter((f) => f.field !== field);

        // Add the new filter
        const newFilters = [...existingFilters];

        // Only add if value is not empty
        if (value !== undefined && value !== null && value !== '') {
          newFilters.push({ field, operator, value });
        }

        // Create new state with page reset
        const newState = {
          ...prev,
          filters: newFilters,
          page: 1,
        };

        // Update URL and generate Prisma filter
        updateUrl(newState);
        const newPrismaFilter = buildPrismaFilter(newState);
        setPrismaFilter(newPrismaFilter);

        return newState;
      });
    },
    [updateUrl, buildPrismaFilter]
  );

  const removeFilter = useCallback(
    (field: string) => {
      setFilterState((prev) => {
        // Remove filter for this field
        const newFilters = prev.filters.filter((f) => f.field !== field);

        // Create new state with page reset
        const newState = {
          ...prev,
          filters: newFilters,
          page: 1,
        };

        // Update URL and generate Prisma filter
        updateUrl(newState);
        const newPrismaFilter = buildPrismaFilter(newState);
        setPrismaFilter(newPrismaFilter);

        return newState;
      });
    },
    [updateUrl, buildPrismaFilter]
  );

  const setRangeFilter = useCallback(
    (field: string, min?: any, max?: any) => {
      if ((min === undefined || min === null) && (max === undefined || max === null)) {
        // If both values are empty, remove the filter
        removeFilter(field);
        return;
      }

      if (min !== undefined && min !== null && max !== undefined && max !== null) {
        // Both values - use between
        setFilter(field, 'between', [min, max]);
      } else if (min !== undefined && min !== null) {
        // Just min - use gte
        setFilter(field, 'gte', min);
      } else if (max !== undefined && max !== null) {
        // Just max - use lte
        setFilter(field, 'lte', max);
      }
    },
    [setFilter, removeFilter]
  );

  const setAdvancedFilters = useCallback(
    (advancedFilters: AdvancedFilters) => {
      setFilterState((prev) => {
        const newState = {
          ...prev,
          advancedFilters,
          page: 1,
        };

        // Update URL and generate Prisma filter
        updateUrl(newState);
        const newPrismaFilter = buildPrismaFilter(newState);
        setPrismaFilter(newPrismaFilter);

        return newState;
      });
    },
    [updateUrl, buildPrismaFilter]
  );

  const setSort = useCallback(
    (field: string, direction: 'asc' | 'desc' = 'asc') => {
      setFilterState((prev) => {
        const newState = {
          ...prev,
          sort: [{ field, direction }],
        };

        // Update URL and generate Prisma filter
        updateUrl(newState);
        const newPrismaFilter = buildPrismaFilter(newState);
        setPrismaFilter(newPrismaFilter);

        return newState;
      });
    },
    [updateUrl, buildPrismaFilter]
  );

  const setPage = useCallback(
    (page: number) => {
      setFilterState((prev) => {
        const newState = {
          ...prev,
          page,
        };

        // Update URL and generate Prisma filter
        updateUrl(newState);
        const newPrismaFilter = buildPrismaFilter(newState);
        setPrismaFilter(newPrismaFilter);

        return newState;
      });
    },
    [updateUrl, buildPrismaFilter]
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      setFilterState((prev) => {
        const newState = {
          ...prev,
          pageSize,
          page: 1,
        };

        // Update URL and generate Prisma filter
        updateUrl(newState);
        const newPrismaFilter = buildPrismaFilter(newState);
        setPrismaFilter(newPrismaFilter);

        return newState;
      });
    },
    [updateUrl, buildPrismaFilter]
  );

  const clearAllFilters = useCallback(() => {
    const newState: FilterState = {
      filters: [],
      page: 1,
      pageSize: config.defaultPageSize || 10,
      sort: config.defaultSort ? [config.defaultSort] : [],
    };

    setFilterState(newState);
    updateUrl(newState);
    const newPrismaFilter = buildPrismaFilter(newState);
    setPrismaFilter(newPrismaFilter);
  }, [config, updateUrl, buildPrismaFilter]);

  // Get active filter value
  const getFilterValue = useCallback(
    (field: string) => {
      const filter = filterState.filters.find((f) => f.field === field);
      if (!filter) return undefined;

      if (filter.operator === 'between' && Array.isArray(filter.value)) {
        return { min: filter.value[0], max: filter.value[1] };
      } else if (filter.operator === 'gte') {
        return { min: filter.value };
      } else if (filter.operator === 'lte') {
        return { max: filter.value };
      }

      return filter.value;
    },
    [filterState.filters]
  );

  return {
    // Current state
    filters: filterState.filters,
    advancedFilters: filterState.advancedFilters,
    sort: filterState.sort,
    page: filterState.page,
    pageSize: filterState.pageSize,

    // Generated Prisma filter
    prismaFilter,

    // State manipulation methods
    setFilter,
    removeFilter,
    setRangeFilter,
    setAdvancedFilters,
    setSort,
    setPage,
    setPageSize,
    clearAllFilters,

    // Helper methods
    getFilterValue,

    // For debug
    filterState,
  };
}
