import { z } from 'zod';

export const postSchema = z.object({
  title: z.string().min(3).max(255),
  content: z.string().min(10),
  published: z.boolean().default(false),
  authorId: z.string().uuid(),
  // categoryIds: z.array(z.string().uuid()),
  tagIds: z.array(z.string().uuid()).optional(),
});

export type CreatePostDTO = z.infer<typeof postSchema>;
export type UpdatePostDTO = Partial<CreatePostDTO>;

export interface PostEntity {
  id: string;
  title: string;
  content: string;
  published: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}
