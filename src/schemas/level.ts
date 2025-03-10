import { z } from 'zod';

export const levelSchema = z.object({
  name: z.string({ message: 'Level Name Required' }).nonempty('Level Name Required'),
  institutionId: z.string({ message: 'Select any institutions' }),
});

export type LevelSchemaType = z.infer<typeof levelSchema>;
