import { DB } from "@/types/db";
import { db } from "@/utils/db";
import { type Kysely, type Transaction } from "kysely";

type Database = Kysely<DB> | Transaction<DB>;

export class AuthRepository {
  constructor(private readonly database: Database = db) {}

  withTransaction(trx: Transaction<DB>) {
    return new AuthRepository(trx);
  }

  findPendingVerification(identifier: string) {
    return this.database
      .selectFrom("verification")
      .selectAll()
      .where("verification.identifier", "=", identifier)
      .orderBy("createdAt", "desc")
      .executeTakeFirst();
  }
}
