// src/schemas/userSchema.ts
import { UserRole } from '@prisma/client';
import { z } from 'zod';

// Define the user schema with validation rules
export const userSchema = z.object({
  // fullName: z
  //   .string()
  //   .min(2, { message: 'Full name must be at least 2 characters' })
  //   .max(100, { message: 'Full name must be less than 100 characters' }),

  email: z.string().email({ message: 'Please enter a valid email address' }),

  role: z.nativeEnum(UserRole, {
    required_error: 'Please select a role',
    invalid_type_error: 'Role must be one of the defined options',
  }),

  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),

  // agreeToTerms: z
  //   .boolean()
  //   .refine(val => val === true, {
  //     message: 'You must agree to the terms and conditions'
  //   }),
});

// Export type from zod schema for TypeScript type safety
export type UserFormValues = z.infer<typeof userSchema>;

// Pre-defined roles for dropdown
