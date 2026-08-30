import { redisConnection } from './connection';
import { startOutboxDispatcher } from './dispatcher';
import { scheduleOutboxCleanup } from './jobs/outbox-cleanup';
import { maintenanceQueue, outboxQueue } from './queues';
import { startWorkers } from './workers';

async function main() {
  const stopWorkers = startWorkers();
  const stopDispatcher = startOutboxDispatcher();
  await scheduleOutboxCleanup();

  console.info('[worker] started - dispatcher polling outbox, workers listening for jobs');

  let shuttingDown = false;

  const shutdown = async (signal: string) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    console.info(`[worker] received ${signal}, shutting down`);

    stopDispatcher();
    await stopWorkers();
    await Promise.all([outboxQueue.close(), maintenanceQueue.close()]);
    redisConnection.disconnect();

    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((error) => {
  console.error('[worker] fatal error during startup', error);
  process.exit(1);
});
