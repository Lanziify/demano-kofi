import IORedis from 'ioredis';
import { env } from '@/env';

// BullMQ requires this to be null so it can manage blocking connections itself.
export const redisConnection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });
