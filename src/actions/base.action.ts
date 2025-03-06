'use server';

import { z, ZodType } from 'zod';

/**
 * Base class for server actions with generic CRUD functionality
 * T = Schema Type (from Zod)
 * CreateInput = Type for create operations
 * UpdateInput = Type for update operations
 * ModelType = Type returned by service operations
 * ServiceType = Type of the service
 */
class BaseServerAction<
  T,
  CreateInput = any,
  UpdateInput = any,
  ModelType = any,
  ServiceType extends {
    create: (data: CreateInput) => Promise<ModelType>;
    update: (id: string | number, data: UpdateInput) => Promise<ModelType>;
    delete: (id: string | number) => Promise<ModelType>;
    findById: (id: string | number) => Promise<ModelType | null>;
    findAll: (filters?: any) => Promise<ModelType[]>;
  } = any,
> {
  protected schema: ZodType<T>;
  protected service: ServiceType;

  constructor(schema: ZodType<T>, service: ServiceType) {
    this.schema = schema;
    this.service = service;
  }

  /**
   * Validates form data using the schema
   */
  protected validateFormData(
    formData: FormData
  ):
    | { success: true; data: T }
    | { success: false; errors: { field: string | number; message: string }[] } {
    try {
      const data = Object.fromEntries(formData.entries()) as Record<string, unknown>;

      // Parse and validate the data
      const validatedData = this.schema.parse(data);
      return { success: true, data: validatedData as T };
    } catch (error) {
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
   * Generic error handler for service operations
   */
  protected handleServiceError(error: unknown): {
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

    // Handle Prisma errors or other specific errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return {
      success: false,
      errors: [{ field: 'root', message: errorMessage }],
    };
  }

  /**
   * Generic create operation
   */
  async create(
    formData: FormData
  ): Promise<
    | { success: true; data: ModelType }
    | { success: false; errors: { field: string | number; message: string }[] }
  > {
    const validatedData = this.validateFormData(formData);

    if (!validatedData.success) return validatedData;

    try {
      const result = await this.service.create(validatedData.data as unknown as CreateInput);
      return { success: true, data: result };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Generic update operation
   */
  async update(
    id: string | number,
    formData: FormData
  ): Promise<
    | { success: true; data: ModelType }
    | { success: false; errors: { field: string | number; message: string }[] }
  > {
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
   * Generic delete operation
   */
  async delete(
    id: string | number
  ): Promise<
    | { success: true; data: ModelType }
    | { success: false; errors: { field: string | number; message: string }[] }
  > {
    try {
      const result = await this.service.delete(id);
      return { success: true, data: result };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Generic get by ID operation
   */
  async getById(
    id: string | number
  ): Promise<
    | { success: true; data: ModelType | null }
    | { success: false; errors: { field: string | number; message: string }[] }
  > {
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
  async getAll(
    filters?: any
  ): Promise<
    | { success: true; data: ModelType[] }
    | { success: false; errors: { field: string | number; message: string }[] }
  > {
    try {
      const results = await this.service.findAll(filters);
      return { success: true, data: results };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }
}

export default BaseServerAction;
