import type { Kysely, Transaction } from 'kysely';
import { sql } from 'kysely';
import type { CreateOutboxEventValues } from '@/schema/outbox.schema';
import type { DB } from '@/types/db';
import { db } from '@/utils/db';

type Database = Kysely<DB> | Transaction<DB>;

export class OutboxRepository {
  constructor(private readonly database: Database = db) {}

  withTransaction(trx: Transaction<DB>) {
    return new OutboxRepository(trx);
  }

  create(values: CreateOutboxEventValues) {
    return this.database.insertInto('outbox').values(values).returningAll().executeTakeFirst();
  }

  createMany(values: CreateOutboxEventValues[]) {
    return this.database.insertInto('outbox').values(values).returningAll().execute();
  }

  /**
   * Claims a batch of pending rows for dispatch. Must be called within a transaction -
   * `forUpdate().skipLocked()` is what lets more than one dispatcher instance run safely,
   * each skipping rows another instance already has locked.
   */
  findAndLockPending(limit: number) {
    return this.database
      .selectFrom('outbox')
      .selectAll()
      .where('processedAt', 'is', null)
      .where('failedAt', 'is', null)
      .orderBy('createdAt', 'asc')
      .limit(limit)
      .forUpdate()
      .skipLocked()
      .execute();
  }

  markProcessed(id: string) {
    return this.database.updateTable('outbox').set({ processedAt: new Date() }).where('id', '=', id).execute();
  }

  markFailed(id: string) {
    return this.database.updateTable('outbox').set({ failedAt: new Date() }).where('id', '=', id).execute();
  }

  incrementAttempts(id: string) {
    return this.database
      .updateTable('outbox')
      .set({ attempts: sql`attempts + 1` })
      .where('id', '=', id)
      .execute();
  }

  deleteProcessedBefore(cutoff: Date) {
    return this.database.deleteFrom('outbox').where('processedAt', 'is not', null).where('processedAt', '<', cutoff).execute();
  }
}
