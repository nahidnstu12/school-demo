import { z, ZodType } from 'zod';
import { ActionResult } from './IServerAction';
import BaseServerAction from './base.action';
import { IService } from '@/backend/services/IService';
import { headers } from 'next/headers';
import { FilterFieldConfig } from '@/utils/filter-helpers';

export interface RelationalFieldConfig extends FilterFieldConfig {
  relation?: string; // The related entity name
  relationField?: string; // The field in the related entity
  nestedRelation?: string; // For deeper nesting
}

/**
 * Interface for filter configuration with relation support
 */
export interface RelationalFilterConfig {
  defaultPageSize: number;
  defaultSort?: { field: string; direction: 'asc' | 'desc' };
  fields: Record<string, RelationalFieldConfig>;
  include?: Record<string, boolean>;
  searchFields?: Array<{
    field: string;
    relation?: string;
    relationField?: string;
  }>;
}

/**
 * Extended BaseServerAction with relational filtering capabilities
 */
export abstract class RelationalServerAction<
  T,
  CreateInput,
  UpdateInput,
  ModelType,
  S extends IService<ModelType, CreateInput, UpdateInput>,
> extends BaseServerAction<T, CreateInput, UpdateInput, ModelType, S> {
  protected filterConfig: RelationalFilterConfig;

  constructor(schema: ZodType<T>, service: S, filterConfig: RelationalFilterConfig) {
    super(schema, service);
    this.filterConfig = filterConfig;
  }

  async getItemsWithFilter(formData: FormData): Promise<ActionResult<any>> {
    try {
      const headersList = await headers();
      const url = headersList.get('x-url') || headersList.get('referer') || '';
      const searchParams = new URL(url).searchParams;

      // Extract pagination and sorting parameters from URL
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(
        searchParams.get('pageSize') || String(this.filterConfig.defaultPageSize)
      );
      const sortField =
        searchParams.get('sort') ||
        (this.filterConfig.defaultSort ? this.filterConfig.defaultSort.field : undefined);
      const sortDirection = (searchParams.get('dir') ||
        (this.filterConfig.defaultSort ? this.filterConfig.defaultSort.direction : 'desc')) as
        | 'asc'
        | 'desc';

      // Get search term from search parameter
      const searchTerm = searchParams.get('search') || '';

      // Build filter object from form data
      let filterObject: any = {};
      const filterJson = formData.get('filter') as string;

      if (filterJson) {
        try {
          filterObject = JSON.parse(filterJson);

          // Ensure pagination settings use URL values
          filterObject.skip = (page - 1) * pageSize;
          filterObject.take = pageSize;
          if (this.filterConfig.include) filterObject.include = this.filterConfig.include;

          // Process the filter object to handle special fields and relations
          this.processFilterObject(filterObject);
        } catch (error) {
          console.error('Error parsing filter JSON:', error);
          filterObject = {
            skip: (page - 1) * pageSize,
            take: pageSize,
            where: {},
          };
        }
      } else {
        filterObject = {
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {},
        };
      }

      // Handle sorting with relation mappings
      if (sortField) {
        this.processSortField(filterObject, sortField, sortDirection);
      }

      // Add global search if present
      if (searchTerm) {
        this.addGlobalSearch(filterObject, searchTerm);
      }

      // Log the final processed filter object
      console.log('Processed filter object:', JSON.stringify(filterObject, null, 2));

      // Get data with pagination
      const results = await this.service.findAllPaginated(page, pageSize, filterObject);

      console.log('Results:', JSON.stringify(results.data[0], null, 2));

      return { success: true, data: results };
    } catch (error) {
      console.error('Detailed error:', error);
      return this.handleServiceError(error);
    }
  }

  /**
   * Get relation info for a field from field config
   */
  protected getRelationInfo(
    fieldName: string
  ): { relation: string; field: string; nestedRelation?: string } | null {
    const fieldConfig = this.filterConfig.fields[fieldName];

    if (fieldConfig && fieldConfig.relation && fieldConfig.relationField) {
      return {
        relation: fieldConfig.relation,
        field: fieldConfig.relationField,
        nestedRelation: fieldConfig.nestedRelation,
      };
    }

    return null;
  }

  /**
   * Process the sort field to handle relations
   */
  protected processSortField(
    filterObject: any,
    sortField: string,
    sortDirection: 'asc' | 'desc'
  ): void {
    console.log("sortField>>", sortField, filterObject);
    
    // Get relation info from field config
    const relationInfo = this.getRelationInfo(sortField);

    if (relationInfo) {
      if (relationInfo.nestedRelation) {
        // For nested relations like user.profile.something
        filterObject.orderBy = {
          [relationInfo.relation]: {
            [relationInfo.nestedRelation]: {
              [relationInfo.field]: sortDirection,
            },
          },
        };
      } else {
        // For simple relations like user.firstName
        filterObject.orderBy = {
          [relationInfo.relation]: {
            [relationInfo.field]: sortDirection,
          },
        };
      }
    } else {
      // For direct fields on the model
      filterObject.orderBy = { [sortField]: sortDirection };
    }
  }

  /**
   * Process the filter object to handle special fields and relation mappings
   */
  protected processFilterObject(filterObject: any): void {
    if (!filterObject.where) return;

    // Helper function to process a single condition
    const processCondition = (condition: any): any => {
      if (!condition) return condition;

      // Create a new processed condition
      const processedCondition: any = {};

      // Process each field in the condition
      Object.entries(condition).forEach(([key, value]) => {
        // Handle nested logical operators
        if (['AND', 'OR', 'NOT'].includes(key) && Array.isArray(value)) {
          processedCondition[key] = (value as any[])
            .map((c) => processCondition(c))
            .filter(Boolean);
          return;
        }

        // Handle relation fields using relation info from field config
        const relationInfo = this.getRelationInfo(key);

        if (relationInfo) {
          if (relationInfo.nestedRelation) {
            // For nested relations
            processedCondition[relationInfo.relation] = {
              [relationInfo.nestedRelation]: {
                [relationInfo.field]: this.processValueForCaseInsensitive(value),
              },
            };
          } else {
            // For simple relations
            processedCondition[relationInfo.relation] = {
              ...(processedCondition[relationInfo.relation] || {}),
              [relationInfo.field]: this.processValueForCaseInsensitive(value),
            };
          }
        } else if (key === 'search') {
          // Skip search - handled separately
          return;
        } else {
          // Keep direct fields as-is
          processedCondition[key] = this.processValueForCaseInsensitive(value);
        }
      });

      return processedCondition;
    };

    // Process the top-level where condition
    if (filterObject.where.AND) {
      // Process AND conditions
      filterObject.where.AND = Array.isArray(filterObject.where.AND)
        ? filterObject.where.AND.map(processCondition)
        : [processCondition(filterObject.where.AND)];
    } else if (filterObject.where.OR) {
      // Process OR conditions
      filterObject.where.OR = Array.isArray(filterObject.where.OR)
        ? filterObject.where.OR.map(processCondition)
        : [processCondition(filterObject.where.OR)];
    } else {
      // Process direct conditions
      filterObject.where = processCondition(filterObject.where);
    }
  }

  /**
   * Process value to handle case-insensitive operations for string operators
   */
  protected processValueForCaseInsensitive(value: any): any {
    if (typeof value === 'object' && value !== null) {
      const processedValue: any = {};
      
      Object.entries(value).forEach(([operator, operatorValue]) => {
        // List of operators that should support case-insensitive mode for string values
        const caseInsensitiveOperators = ['equals', 'contains', 'startsWith', 'endsWith'];
        
        if (caseInsensitiveOperators.includes(operator) && typeof operatorValue === 'string') {
          // For string operators, make them case-insensitive
          processedValue[operator] = operatorValue;
          processedValue.mode = 'insensitive';
        } else {
          processedValue[operator] = operatorValue;
        }
      });
      
      return processedValue;
    }
    
    return value;
  }

  /**
   * Add global search to the filter object
   */
  protected addGlobalSearch(filterObject: any, searchTerm: string): void {
    if (!filterObject.where) {
      filterObject.where = {};
    }

    // Create search conditions based on searchFields config or defaults
    const searchConditions: any[] = [];

    if (this.filterConfig.searchFields && this.filterConfig.searchFields.length > 0) {
      // Use configured search fields
      this.filterConfig.searchFields.forEach((searchField) => {
        if (searchField.relation && searchField.relationField) {
          // For relation fields
          searchConditions.push({
            [searchField.relation]: {
              [searchField.relationField]: { 
                contains: searchTerm,
                mode: 'insensitive'
              },
            },
          });
        } else {
          // For direct fields
          searchConditions.push({
            [searchField.field]: { 
              contains: searchTerm,
              mode: 'insensitive'
            },
          });
        }
      });
    } else {
      // Default to search in all string fields from filter config
      Object.entries(this.filterConfig.fields).forEach(([field, config]) => {
        if (config.type === 'string') {
          const relationInfo = this.getRelationInfo(field);

          if (relationInfo) {
            // For relation fields
            searchConditions.push({
              [relationInfo.relation]: {
                [relationInfo.field]: { 
                  contains: searchTerm,
                  mode: 'insensitive'
                },
              },
            });
          } else {
            // For direct fields
            searchConditions.push({
              [field]: { 
                contains: searchTerm,
                mode: 'insensitive'
              },
            });
          }
        }
      });
    }

    // Handle the different ways where conditions might be structured
    if (!filterObject.where.AND && !filterObject.where.OR) {
      // If there are no existing AND/OR conditions, create a new OR for search
      filterObject.where = {
        AND: [
          filterObject.where, // Keep existing direct conditions
          { OR: searchConditions }, // Add search conditions as OR
        ],
      };
    } else if (filterObject.where.AND) {
      // If there's an existing AND, add our search as another item in the AND array
      if (!Array.isArray(filterObject.where.AND)) {
        filterObject.where.AND = [filterObject.where.AND];
      }
      filterObject.where.AND.push({ OR: searchConditions });
    } else if (filterObject.where.OR) {
      // If there's an existing OR, wrap everything in an AND
      const existingOr = filterObject.where.OR;
      filterObject.where = {
        AND: [
          { OR: existingOr }, // Keep existing OR conditions
          { OR: searchConditions }, // Add search conditions as OR
        ],
      };
    }
  }
}
