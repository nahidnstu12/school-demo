import { PostRepository } from '@/repositories/post.repository';
import type {
  PostEntity} from '@/types/post';
import {
  CreatePostDTO,
  UpdatePostDTO,
  postSchema,
} from '@/types/post';
import type { SearchParams } from '@/types/common';
import { BaseService } from './base.service';
import { Redis } from 'ioredis';

export class PostService extends BaseService<PostEntity> {
  private postRepository: PostRepository;

  // constructor(redis: Redis) {
  constructor() {
    // const repository = new PostRepository(redis);

    const repository = new PostRepository();
    super(repository);
    this.postRepository = repository;
  }

  // async create(data: CreatePostDTO): Promise<PostEntity> {
  //   const validated = postSchema.parse(data);
  //   // return this.postRepository.create(validated);
  //   return this.postRepository.create(validated);

  // }

  // async update(id: string, data: UpdatePostDTO): Promise<PostEntity> {
  //   const validated = postSchema.partial().parse(data);
  //   return this.postRepository.update(id, validated);
  // }

  // async search(params: SearchParams): Promise<PaginatedResponse<PostEntity>> {
  async search(params: SearchParams): Promise<PostEntity> {
    const { query, ...rest } = params;

    const filters = {
      OR: query
        ? [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ]
        : undefined,
      ...rest.filters,
    };

    return this.postRepository.findAll({
      ...rest,
      filters,
    });
  }
}
