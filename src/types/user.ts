import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  role: z.enum(['TEACHER', 'STUDENT', 'STAFF'], { message: 'Invalid role' }),
});

export type UserSchemaType = z.infer<typeof userSchema>;
