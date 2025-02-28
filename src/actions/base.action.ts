'use server';

import { z, ZodType } from 'zod';

class BaseServerAction<T> {
  schema: ZodType<T>;

  constructor(schema: ZodType<T>) {
    this.schema = schema;
  }

  validateFormData(
    formData: FormData
  ):
    | { success: true; data: any }
    | { success: false; errors: { field: string | number; message: string }[] } {
    try {
      const data = Object.fromEntries(formData.entries()) as Record<string, unknown>;

      this.schema.parse(data);
      return { success: true, data };
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
}

export default BaseServerAction;
