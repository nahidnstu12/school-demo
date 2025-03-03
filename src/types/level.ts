import { z } from 'zod';

export const levelSchema = z.object({
  name: z.string(),
  institutionId: z.string(),
});

export type LevelSchemaType = z.infer<typeof levelSchema>;
