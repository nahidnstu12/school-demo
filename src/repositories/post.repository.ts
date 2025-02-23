import { BaseRepository } from './base.repository';
import { PostEntity, CreatePostDTO, UpdatePostDTO } from '@/types/post';
import { SearchParams } from '@/types/common';
// import { Redis } from 'ioredis';
// import { settings } from '@/config/settings';

export class PostRepository extends BaseRepository<PostEntity> {
  // private redis: Redis;

  // constructor(redis: Redis) {
  constructor() {
    super('post');
  }
  // this.redis = redis;

  // async findAll(params: SearchParams) {
  //   const cacheKey = `posts:${JSON.stringify(params)}`;
  //   // const cached = await this.redis.get(cacheKey);

  //   // if (cached) {
  //   //   return JSON.parse(cached);
  //   // }

  //   const result = await super.findAll({
  //     ...params,
  //     // include: {
  //     //   author: true,
  //     //   categories: true,
  //     //   tags: true
  //     // }
  //   });

  //   // await this.redis.setex(
  //   //   cacheKey,
  //   //   settings.cache.ttl,
  //   //   JSON.stringify(result)
  //   // );

  //   return result;
  // }

  // async create(data: CreatePostDTO): Promise<PostEntity> {
  //   const post = await super.create(data);
  //   // await this.redis.del('posts:*');
  //   return post;
  // }

  // async update(id: string, data: UpdatePostDTO): Promise<PostEntity> {
  //   const post = await super.update(id, data);
  //   await Promise.all([
  //     // this.redis.del(`post:${id}`),
  //     // this.redis.del('posts:*')
  //   ]);
  //   return post;
  // }
}
