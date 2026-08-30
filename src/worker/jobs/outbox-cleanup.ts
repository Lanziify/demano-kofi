import type { Job } from 'bullmq';
import { OutboxRepository } from '@/repository/outbox.repository';
import { maintenanceQueue } from '../queues';

export const OUTBOX_CLEANUP_JOB_NAME = 'outbox-cleanup';

const RETENTION_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

const outboxRepository = new OutboxRepository();

/** Deletes outbox rows that finished processing more than RETENTION_DAYS ago. */
export async function cleanupOutbox() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * DAY_MS);
  const result = await outboxRepository.deleteProcessedBefore(cutoff);

  console.info(`[outbox-cleanup] deleted processed outbox rows older than ${cutoff.toISOString()}`, result);
}

/** Idempotent: upserting the same scheduler id again just updates it in place, no duplicates. */
export async function scheduleOutboxCleanup() {
  await maintenanceQueue.upsertJobScheduler(OUTBOX_CLEANUP_JOB_NAME, { pattern: '0 3 * * *' }, { name: OUTBOX_CLEANUP_JOB_NAME });
}

export async function routeMaintenanceJob(job: Job) {
  if (job.name !== OUTBOX_CLEANUP_JOB_NAME) {
    throw new Error(`No processor registered for maintenance job "${job.name}"`);
  }

  await cleanupOutbox();
}
