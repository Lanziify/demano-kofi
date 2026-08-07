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
}
