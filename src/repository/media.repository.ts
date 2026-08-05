import type { Kysely, Transaction } from 'kysely';
import type { DB } from '@/types/db';
import { db } from '@/utils/db';

type Database = Kysely<DB> | Transaction<DB>;

export class MediaRepository {
  constructor(private readonly database: Database = db) {}

  withTransaction(trx: Transaction<DB>) {
    return new MediaRepository(trx);
  }
}
