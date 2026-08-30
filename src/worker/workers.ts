import { type Job, Worker } from 'bullmq';
import { OutboxRepository } from '@/repository/outbox.repository';
import { redisConnection } from './connection';
import { routeMaintenanceJob } from './jobs/outbox-cleanup';
import { processProductImageEvent } from './processors/product-image.processor';

const outboxRepository = new OutboxRepository();

const outboxProcessors: Record<string, (job: Job) => Promise<void>> = {
  'product.image.process_requested': processProductImageEvent,
};

async function routeOutboxJob(job: Job) {
  const processor = outboxProcessors[job.name];

  if (!processor) {
    throw new Error(`No processor registered for outbox event type "${job.name}"`);
  }

  await processor(job);

  if (job.id) {
    await outboxRepository.markProcessed(job.id);
  }
}

export function startWorkers() {
  const outboxWorker = new Worker('outbox', routeOutboxJob, { connection: redisConnection, concurrency: 2 });
  const maintenanceWorker = new Worker('maintenance', routeMaintenanceJob, { connection: redisConnection, concurrency: 1 });

  outboxWorker.on('failed', async (job, error) => {
    if (!job?.id) {
      return;
    }

    console.error(`[outbox-worker] job ${job.id} (${job.name}) failed on attempt ${job.attemptsMade}`, error);
    await outboxRepository.incrementAttempts(job.id);

    const maxAttempts = job.opts.attempts ?? 1;

    if (job.attemptsMade >= maxAttempts) {
      await outboxRepository.markFailed(job.id);
      console.error(`[outbox-worker] job ${job.id} (${job.name}) exhausted retries - flagged failed_at`);
    }
  });

  maintenanceWorker.on('failed', (job, error) => {
    console.error(`[maintenance-worker] job ${job?.id} (${job?.name}) failed`, error);
  });

  return async () => {
    await Promise.all([outboxWorker.close(), maintenanceWorker.close()]);
  };
}
