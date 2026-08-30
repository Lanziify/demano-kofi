import type { Kysely, Transaction } from 'kysely';
import type { CreateMediaSchemaValue } from '@/schema/media.schema';
import type { DB } from '@/types/db';
import { db } from '@/utils/db';

type Database = Kysely<DB> | Transaction<DB>;

export class MediaRepository {
  constructor(private readonly database: Database = db) {}

  withTransaction(trx: Transaction<DB>) {
    return new MediaRepository(trx);
  }

  async createMany(values: CreateMediaSchemaValue[]) {
    return this.database.insertInto('media').values(values).returningAll().execute();
  }

  /**
   * Safe to call more than once with the same `storageKey` (e.g. a retried job) -
   * returns the existing row instead of erroring or creating a duplicate.
   */
  async createIfNotExists(values: CreateMediaSchemaValue) {
    const inserted = await this.database
      .insertInto('media')
      .values(values)
      .onConflict((oc) => oc.column('storageKey').doNothing())
      .returningAll()
      .executeTakeFirst();

    if (inserted) {
      return inserted;
    }

    return this.database.selectFrom('media').selectAll().where('storageKey', '=', values.storageKey).executeTakeFirstOrThrow();
  }

  /** Finds every variant (original/large/thumbnail) sharing an image's storage folder. */
  async findByStorageKeyPrefix(prefix: string) {
    return this.database.selectFrom('media').selectAll().where('storageKey', 'like', `${prefix}%`).execute();
  }

  async deleteManyByIds(ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    return this.database.deleteFrom('media').where('id', 'in', ids).returningAll().execute();
  }
}
