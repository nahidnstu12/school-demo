export const settings = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT!) || 6379,
    password: process.env.REDIS_PASSWORD,
  },
  cache: {
    ttl: 3600, // 1 hour
    prefix: 'app:',
  },
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
};
