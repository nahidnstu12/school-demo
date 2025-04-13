import { z, ZodType } from 'zod';
import { ActionResult } from './IServerAction';
import BaseServerAction from './base.action';
import { IService } from '@/services/IService';
import { headers } from 'next/headers';
import { FilterFieldConfig } from '@/utils/filter-helpers';

/**
 * Interface for relation field mapping
 */
export interface RelationFieldMapping {
  [key: string]: {
    relation: string;
    field: string;
    type?: 'filter' | 'sort' | 'both'; //maybe not required
    nestedRelation?: string; //maybe require for recursive nesting options
  };
}

/**
 * Interface for filter configuration with relation support
 */
export interface RelationalFilterConfig {
  defaultPageSize: number;
  defaultSort?: { field: string; direction: 'asc' | 'desc' };
  fields: {
    [key: string]: {
      type: FilterFieldConfig['type'];
      defaultOperator?: string;
      urlParam?: string;
      relation?: string; // Optional relation name
      relationField?: string; // Optional relation field
    };
  };
  relationMappings?: RelationFieldMapping;
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
  protected relationMappings: RelationFieldMapping;

  constructor(
    schema: ZodType<T>,
    service: S,
    filterConfig: RelationalFilterConfig,
    relationMappings: RelationFieldMapping = {}
  ) {
    super(schema, service);
    this.filterConfig = filterConfig;

    // Combine provided mappings with any from filter config
    this.relationMappings = {
      ...relationMappings,
      ...(filterConfig.relationMappings || {}),
    };
  }

  /**
   * Get items with filtering that handles relations properly
   */
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

      return { success: true, data: results };
    } catch (error) {
      console.error('Detailed error:', error);
      return this.handleServiceError(error);
    }
  }

  /**
   * Process the sort field to handle relations
   */
  protected processSortField(
    filterObject: any,
    sortField: string,
    sortDirection: 'asc' | 'desc'
  ): void {
    // Check if this is a relation field that needs special handling
    const relationInfo = this.relationMappings[sortField];

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

        // Handle relation fields using the mapping
        const relationInfo = this.relationMappings[key];
        if (relationInfo) {
          if (relationInfo.nestedRelation) {
            // For nested relations
            processedCondition[relationInfo.relation] = {
              [relationInfo.nestedRelation]: {
                [relationInfo.field]: value,
              },
            };
          } else {
            // For simple relations
            processedCondition[relationInfo.relation] = {
              ...(processedCondition[relationInfo.relation] || {}),
              [relationInfo.field]: value,
            };
          }
        } else if (key === 'search') {
          // Skip search - handled separately
          return;
        } else {
          // Check in filter config if this is a relation field
          const fieldConfig = this.filterConfig.fields[key];
          if (fieldConfig && fieldConfig.relation && fieldConfig.relationField) {
            processedCondition[fieldConfig.relation] = {
              ...(processedCondition[fieldConfig.relation] || {}),
              [fieldConfig.relationField]: value,
            };
          } else {
            // Keep direct fields as-is
            processedCondition[key] = value;
          }
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
              [searchField.relationField]: { contains: searchTerm },
            },
          });
        } else {
          // For direct fields
          searchConditions.push({
            [searchField.field]: { contains: searchTerm, mode: 'insensitive' },
          });
        }
      });
    } else {
      // Default to search in all string fields from filter config
      Object.entries(this.filterConfig.fields).forEach(([field, config]) => {
        if (config.type === 'string') {
          if (config.relation && config.relationField) {
            // For relation fields
            searchConditions.push({
              [config.relation]: {
                [config.relationField]: { contains: searchTerm, mode: 'insensitive' },
              },
            });
          } else {
            // For direct fields
            searchConditions.push({
              [field]: { contains: searchTerm, mode: 'insensitive' },
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
