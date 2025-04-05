/**
 * Type definitions for the dynamic filter system
 */
export type FilterOperator =
  | 'equals'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'between';

export type FilterFieldConfig = {
  // type: string | number | boolean   ;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array';
  defaultOperator?: FilterOperator;
  urlParam?: string; // Custom URL param name (defaults to field name)
  multiValue?: boolean; // Whether the field can have multiple values (for 'in' operator)
  allowedOperators?: FilterOperator[]; // Restrict operators for this field
};

export type FilterConfig = {
  fields: Record<string, FilterFieldConfig>;
  defaultSort?: { field: string; direction: 'asc' | 'desc' };
  defaultPageSize?: number;
};

export type SimpleFilter = {
  field: string;
  operator: FilterOperator;
  value: any;
};

export type AdvancedFilters = {
  AND?: SimpleFilter[];
  OR?: SimpleFilter[];
  NOT?: SimpleFilter[];
};

export type FilterState = {
  filters: SimpleFilter[];
  advancedFilters?: AdvancedFilters;
  sort?: { field: string; direction: 'asc' | 'desc' }[];
  page: number;
  pageSize: number;
};

/**
 * Helper utility to convert between URL params and filter state
 */
export class FilterUrlUtils {
  /**
   * Parse a value from URL according to field type
   */
  static parseValue(value: string, type: string): any {
    switch (type) {
      case 'number':
        return parseFloat(value);
      case 'boolean':
        return value === 'true';
      case 'date':
        return new Date(value);
      case 'array':
        try {
          return JSON.parse(value);
        } catch (e) {
          return value.split(',').map((v) => v.trim());
        }
      default:
        return value;
    }
  }

  /**
   * Format a value for URL according to field type
   */
  static formatValue(value: any, type: string): string {
    if (value === undefined || value === null) return '';

    switch (type) {
      case 'boolean':
        return value ? 'true' : 'false';
      case 'date':
        return value instanceof Date ? value.toISOString() : value;
      case 'array':
        return Array.isArray(value) ? JSON.stringify(value) : value.toString();
      default:
        return value.toString();
    }
  }

  /**
   * Extract field operator from URL param (field:operator format)
   */
  static parseFieldParam(param: string): { field: string; operator?: FilterOperator } {
    const parts = param.split(':');
    if (parts.length === 2) {
      return { field: parts[0], operator: parts[1] as FilterOperator };
    }
    return { field: param };
  }

  /**
   * Create URL param from field and operator
   */
  static formatFieldParam(field: string, operator?: FilterOperator): string {
    return operator ? `${field}:${operator}` : field;
  }
}
