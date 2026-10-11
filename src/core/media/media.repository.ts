import { type Kysely, sql, type Transaction } from 'kysely';
import { db } from '@/core/db/db';
import type { DB } from '@/core/db/types';
import type { CreateMediaSchemaValue, CreateMediaVariantValues, MediaStatus } from '@/core/media/media.schema';

type Database = Kysely<DB> | Transaction<DB>;

export class MediaRepository {
  constructor(private readonly database: Database = db) {}

  withTransaction(trx: Transaction<DB>) {
    return new MediaRepository(trx);
  }

  async createMany(values: CreateMediaSchemaValue[]) {
    return this.database.insertInto('media').values(values).returningAll().execute();
  }

  async findById(id: string) {
    return this.database.selectFrom('media').selectAll().where('id', '=', id).executeTakeFirst();
  }

  /** Safe to call more than once for the same (mediaId, name) pair - e.g. a retried job. */
  async createVariantIfNotExists(values: CreateMediaVariantValues) {
    return this.database
      .insertInto('mediaVariants')
      .values(values)
      .onConflict((oc) => oc.columns(['mediaId', 'name']).doNothing())
      .execute();
  }

  async updateStatus(id: string, status: MediaStatus) {
    return this.database
      .updateTable('media')
      .set({ status, updatedAt: sql`now()` })
      .where('id', '=', id)
      .executeTakeFirst();
  }

  /** Storage keys of the originals and every generated variant, so callers can clean up storage after a delete. */
  async findStorageKeys(ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    const rows = await this.database
      .selectFrom('media')
      .select('storageKey')
      .where('id', 'in', ids)
      .union((eb) => eb.selectFrom('mediaVariants').select('storageKey').where('mediaId', 'in', ids))
      .execute();

    return rows.map((row) => row.storageKey);
  }

  /** Variants are removed with their media (`on delete cascade`). */
  async deleteManyByIds(ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    return this.database.deleteFrom('media').where('id', 'in', ids).returningAll().execute();
  }
}
