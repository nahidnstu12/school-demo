import { z } from 'zod';

export const institutionSchema = z.object({
  name: z.string(),
  address: z.string(),
  contactNumber: z.string(),
  email: z.string().email(),
});

export type InstitutionFormValues = z.infer<typeof institutionSchema>;
