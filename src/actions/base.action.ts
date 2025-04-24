import { z, ZodType } from 'zod';
import { Prisma } from '@prisma/client';
import { IService } from '@/services/IService';
import { ActionResult, IServerAction } from './IServerAction';

abstract class BaseServerAction<
  T,
  CreateInput,
  UpdateInput,
  ModelType,
  S extends IService<ModelType, CreateInput, UpdateInput>,
> implements IServerAction<T, ModelType>
{
  protected schema: ZodType<T>;
  protected service: S;
  protected createManySchema?: ZodType<T[]>;

  constructor(schema: ZodType<T>, service: S, createManySchema?: ZodType<T[]>) {
    this.schema = schema;
    this.service = service;
    this.createManySchema = createManySchema;
  }

  /**
   * Validates form data using the schema
   */
  validateFormData(
    formData: FormData
  ):
    | { success: true; data: T }
    | { success: false; errors: { field: string | number; message: string }[] } {
    try {
      const data = Object.fromEntries(formData.entries()) as Record<string, unknown>;
      
      
      console.log('data base>>', data);

      // Handle JSON formatted data (useful for arrays or complex objects)
      if (data.jsonData && typeof data.jsonData === 'string') {
        try {
          const jsonData = JSON.parse(data.jsonData as string);
          // Parse and validate the data
          const validatedData = this.schema.parse(jsonData);
          return validatedData as { success: true; data: T };
        } catch (jsonError) {
          return {
            success: false,
            errors: [{ field: 'jsonData', message: 'Invalid JSON format' }],
          };
        }
      }

      // Parse and validate the standard form data

      const validatedData = this.schema.parse(data);
      console.log("validateData field>>", JSON.stringify(validatedData, null, 2));
      
      return {success: true, data: validatedData} as { success: true; data: T };
    } catch (error) {
      console.log('validateFormData error>>', JSON.stringify(error, null, 2), error);
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        }));
        return { success: false, errors };
      }
      return {
        success: false,
        errors: [{ field: 'unknown', message: 'Unexpected error from form validation' }],
      };
    }
  }

  /**
   * Validates form data for multiple items
   */
  protected validateFormDataForMany(
    formData: FormData
  ):
    | { success: true; data: T[] }
    | { success: false; errors: { field: string | number; message: string }[] } {
    try {
      const data = Object.fromEntries(formData.entries()) as Record<string, unknown>;

      // We expect JSON data for bulk operations
      if (!data.jsonData || typeof data.jsonData !== 'string') {
        return {
          success: false,
          errors: [{ field: 'jsonData', message: 'JSON data is required for bulk operations' }],
        };
      }

      try {
        const jsonData = JSON.parse(data.jsonData as string);

        // If we have a specific schema for createMany, use it
        if (this.createManySchema) {
          const validatedData = this.createManySchema.parse(jsonData);
          return { success: true, data: validatedData as T[] };
        }

        // Fallback: Validate each item with the regular schema
        if (!Array.isArray(jsonData)) {
          return {
            success: false,
            errors: [{ field: 'jsonData', message: 'Expected an array of items' }],
          };
        }

        const validationErrors: { field: string | number; message: string }[] = [];
        const validatedItems: T[] = [];

        jsonData.forEach((item, index) => {
          try {
            const validatedItem = this.schema.parse(item);
            validatedItems.push(validatedItem as T);
          } catch (itemError) {
            if (itemError instanceof z.ZodError) {
              itemError.errors.forEach((err) => {
                validationErrors.push({
                  field: `[${index}].${err.path.join('.')}`,
                  message: err.message,
                });
              });
            }
          }
        });

        if (validationErrors.length > 0) {
          return { success: false, errors: validationErrors };
        }

        return { success: true, data: validatedItems };
      } catch (jsonError) {
        return {
          success: false,
          errors: [{ field: 'jsonData', message: 'Invalid JSON format' }],
        };
      }
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Generic error handler for service operations
   */
  handleServiceError(error: unknown): {
    success: false;
    errors: { field: string | number; message: string }[];
  } {
    console.error('Service operation error:', error);

    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path[0],
        message: err.message,
      }));
      return { success: false, errors };
    }

    // Handle Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle unique constraint violations
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string[]) || ['unknown'];
        return {
          success: false,
          errors: target.map((field) => ({
            field,
            message: `The ${field} must be unique`,
          })),
        };
      }

      // Handle record not found
      if (error.code === 'P2025') {
        return {
          success: false,
          errors: [{ field: 'id', message: 'Record not found' }],
        };
      }
    }

    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return {
      success: false,
      errors: [{ field: 'root', message: errorMessage }],
    };
  }

  /**
   * Generic create operation
   */
  async create(formData: FormData): Promise<ActionResult<ModelType>> {
    const validatedData = this.validateFormData(formData);
    if (!validatedData.success) return validatedData;
    console.log("validateData create action>>", validatedData);
    
    try {
      const result = await this.service.create(validatedData?.data as unknown as CreateInput);
      console.log("create data successfully", result);
      
      return { success: true, data: result };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Generic createMany operation for bulk inserts
   */
  async createMany(formData: FormData): Promise<ActionResult<Prisma.BatchPayload>> {
    const validatedData = this.validateFormDataForMany(formData);

    if (!validatedData.success) return validatedData;

    try {
      const result = await this.service.createMany(validatedData.data as unknown as CreateInput[]);
      return { success: true, data: result };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Generic update operation
   */
  async update(id: string | number, formData: FormData): Promise<ActionResult<ModelType>> {
    const validatedData = this.validateFormData(formData);

    if (!validatedData.success) return validatedData;

    try {
      const result = await this.service.update(id, validatedData.data as unknown as UpdateInput);
      return { success: true, data: result };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Generic upsert operation (create or update)
   */
  async upsert(id: string | number, formData: FormData): Promise<ActionResult<ModelType>> {
    const validatedData = this.validateFormData(formData);

    if (!validatedData.success) return validatedData;

    try {
      // First check if the record exists
      const existing = await this.service.findById(id);

      if (existing) {
        // Update existing record
        const result = await this.service.update(id, validatedData.data as unknown as UpdateInput);
        return { success: true, data: result };
      } else {
        // Create new record
        const result = await this.service.create(validatedData.data as unknown as CreateInput);
        return { success: true, data: result };
      }
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Generic delete operation
   */
  async delete(id: string | number): Promise<ActionResult<ModelType>> {
    try {
      const result = await this.service.delete(id);
      return { success: true, data: result };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Soft delete operation
   */
  async softDelete(id: string | number): Promise<ActionResult<ModelType>> {
    try {
      const result = await this.service.softDelete(id);
      return { success: true, data: result };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Generic get by ID operation
   */
  async getById(id: string | number): Promise<ActionResult<ModelType | null>> {
    try {
      const result = await this.service.findById(id);
      return { success: true, data: result };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Generic get all operation
   */
  async getAll(filters?: any): Promise<ActionResult<ModelType[]>> {
    try {
      const results = await this.service.findAll(filters);
      return { success: true, data: results };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Aggregate operation
   */
  async aggregate(params: any): Promise<ActionResult<any>> {
    try {
      const result = await this.service.aggregate(params);
      return { success: true, data: result };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Execute raw SQL query
   */
  async executeRawQuery(formData: FormData): Promise<ActionResult<any>> {
    try {
      const data = Object.fromEntries(formData.entries()) as Record<string, unknown>;

      if (!data.query || typeof data.query !== 'string') {
        return {
          success: false,
          errors: [{ field: 'query', message: 'SQL query is required' }],
        };
      }

      const values = data.values ? JSON.parse(data.values as string) : [];

      const result = await this.service.executeRawQuery(data.query, ...values);
      return { success: true, data: result };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Generic count operation
   */
  async count(filters?: any): Promise<ActionResult<number>> {
    try {
      const count = await this.service.count(filters);
      return { success: true, data: count };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Generic find one operation with custom filters
   */
  async findOne(filters: any): Promise<ActionResult<ModelType | null>> {
    try {
      const result = await this.service.findOne(filters);
      return { success: true, data: result };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }
}

export default BaseServerAction;
