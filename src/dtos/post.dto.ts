import type { PostEntity } from '@/types/post';

export class PostDTO {
  static toListItem(post: PostEntity) {
    return {
      id: post.id,
      title: post.title,
      excerpt: post.content.substring(0, 150) + '...',
      author: post.author.name,
      createdAt: post.createdAt,
      categories: post.categories.map((c) => c.name),
      published: post.published,
    };
  }

  static toDetail(post: PostEntity) {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      author: {
        id: post.author.id,
        name: post.author.name,
        email: post.author.email,
      },
      categories: post.categories.map((c) => ({
        id: c.id,
        name: c.name,
      })),
      tags: post.tags.map((t) => ({
        id: t.id,
        name: t.name,
      })),
      published: post.published,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }
}
