import { settings } from '@/config/settings';
import type { Redis } from 'ioredis';

export class CacheManager {
  private redis: Redis;
  private prefix: string;

  constructor(redis: Redis, prefix: string = settings.cache.prefix) {
    this.redis = redis;
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(this.getKey(key));
    return data ? JSON.parse(data) : null;
  }

  async set<T>(
    key: string,
    value: T,
    ttl: number = settings.cache.ttl
  ): Promise<void> {
    await this.redis.setex(this.getKey(key), ttl, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this.redis.del(this.getKey(key));
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(this.getKey(pattern));
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
