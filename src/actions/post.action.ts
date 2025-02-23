'use server';

import { PostService } from '@/services/post.service';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
import { CreatePostDTO, UpdatePostDTO } from '@/types/post';

const postService = new PostService();

type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function createPost(formData: FormData): Promise<ActionResponse<CreatePostDTO>> {
  // const session = await getServerSession(authOptions);

  // if (!session) {
  //   return {
  //     success: false,
  //     error: 'Unauthorized'
  //   };
  // }

  try {
    const data: CreatePostDTO = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      authorId: 'session.user.id',
      // categoryIds: formData.getAll('categories') as string[],
      tagIds: formData.getAll('tags') as string[],
      published: formData.get('published') === 'true',
    };

    const post = await postService.create(data);
    revalidatePath('/posts');

    return {
      success: true,
      data: post,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function updatePost(
  id: string,
  formData: FormData
): Promise<ActionResponse<UpdatePostDTO>> {
  // const session = await getServerSession(authOptions);

  // if (!session) {
  //   return {
  //     success: false,
  //     error: 'Unauthorized'
  //   };
  // }

  try {
    const data: UpdatePostDTO = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      // categoryIds: formData.getAll('categories') as string[],
      tagIds: formData.getAll('tags') as string[],
      published: formData.get('published') === 'true',
    };

    const post = await postService.update(id, data);
    revalidatePath(`/posts/${id}`);

    return {
      success: true,
      data: post,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
