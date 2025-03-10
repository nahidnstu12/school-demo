import { z } from 'zod';

export const levelSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Level name must be at least 3 characters long' })
    .max(50, { message: 'Level name must be less than 50 characters' })
    .trim(),

  institutionId: z.string().min(1, { message: 'Institution is required' }),

  hasShift: z
    .union([z.boolean(), z.string().transform((val) => val === 'true')])
    .optional()
    .default(false),

  hasGroup: z
    .union([z.boolean(), z.string().transform((val) => val === 'true')])
    .optional()
    .default(false),

  hasSection: z
    .union([z.boolean(), z.string().transform((val) => val === 'true')])
    .optional()
    .default(false),
});

export type LevelSchemaType = z.infer<typeof levelSchema>;
