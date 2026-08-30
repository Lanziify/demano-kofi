import { OutboxRepository } from '@/repository/outbox.repository';
import { db } from '@/utils/db';
import { outboxQueue } from './queues';

const POLL_INTERVAL_MS = 5_000;
const BATCH_SIZE = 20;

const outboxRepository = new OutboxRepository();

/**
 * Relays pending outbox rows to BullMQ. Enqueues with `jobId = outbox row id`, so
 * re-polling the same still-in-flight row (nothing marks it "claimed" between polls -
 * only the worker flips `processed_at` once the job is fully done) is a safe no-op:
 * BullMQ won't create a second job for an id that already exists.
 */
async function dispatchPendingEvents() {
  await db.transaction().execute(async (trx) => {
    const repo = outboxRepository.withTransaction(trx);
    const rows = await repo.findAndLockPending(BATCH_SIZE);

    for (const row of rows) {
      await outboxQueue.add(row.eventType, JSON.parse(row.payload), {
        jobId: row.id,
        attempts: 5,
        backoff: { type: 'exponential', delay: 5_000 },
        removeOnComplete: true,
        removeOnFail: { count: 1000 },
      });
    }
  });
}

export function startOutboxDispatcher() {
  const timer = setInterval(() => {
    dispatchPendingEvents().catch((error) => {
      console.error('[outbox-dispatcher] failed to dispatch pending events', error);
    });
  }, POLL_INTERVAL_MS);

  return () => clearInterval(timer);
}
