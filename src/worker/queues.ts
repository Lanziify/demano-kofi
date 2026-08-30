import { Queue } from 'bullmq';
import { redisConnection } from './connection';

/** Jobs dispatched from the `outbox` table. Job name = outbox `event_type`. */
export const outboxQueue = new Queue('outbox', { connection: redisConnection });

/** Periodic maintenance jobs unrelated to any single outbox event. */
export const maintenanceQueue = new Queue('maintenance', { connection: redisConnection });
