import type { Kysely, Transaction } from 'kysely';
import type { DB } from '@/types/db';
import { db } from '@/utils/db';

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
