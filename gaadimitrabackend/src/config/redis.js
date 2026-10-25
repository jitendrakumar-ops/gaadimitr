import Redis from 'ioredis';
import logger from '../utils/logger.js';

let redis = null;

export const initRedis = () => {
  if (redis) return redis;

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false,
    retryStrategy(times) {
      const delay = Math.min(times * 200, 3000);
      logger.warn(`Redis reconnecting attempt ${times}, delaying ${delay}ms`);
      return delay;
    },
    reconnectOnError(err) {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    }
  });

  redis.on('connect', () => {
    logger.info('Redis client connected');
  });

  redis.on('ready', () => {
    logger.info('Redis client ready');
  });

  redis.on('error', (err) => {
    logger.error({ err: err.message }, 'Redis connection error');
  });

  redis.on('close', () => {
    logger.warn('Redis connection closed');
  });

  return redis;
};

export const getRedisClient = () => {
  if (!redis) {
    return initRedis();
  }
  return redis;
};

export const setMockRedisClient = (mockClient) => {
  redis = mockClient;
};

export const closeRedis = async () => {
  if (redis) {
    if (typeof redis.quit === 'function') {
      await redis.quit();
    }
    redis = null;
    logger.info('Redis client disconnected cleanly');
  }
};

export default { initRedis, getRedisClient, setMockRedisClient, closeRedis };

