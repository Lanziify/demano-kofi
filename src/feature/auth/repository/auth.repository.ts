import type { Kysely, Transaction } from 'kysely';
import { db } from '@/core/db/db';
import type { DB } from '@/core/db/types';

type Database = Kysely<DB> | Transaction<DB>;

export class AuthRepository {
  constructor(private readonly database: Database = db) {}

  withTransaction(trx: Transaction<DB>) {
    return new AuthRepository(trx);
  }

  findPendingVerification(identifier: string) {
    return this.database
      .selectFrom('verification')
      .selectAll()
      .where('verification.identifier', '=', identifier)
      .orderBy('createdAt', 'desc')
      .executeTakeFirst();
  }
}
