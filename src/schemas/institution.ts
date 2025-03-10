import { z } from 'zod';

export const institutionSchema = z.object({
  name: z.string(),
  institutionId: z.string(),
});

export type InstitutionFormValues = z.infer<typeof institutionSchema>;
