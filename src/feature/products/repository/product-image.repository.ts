import type { Kysely, Transaction } from 'kysely';
import type { DB } from '@/types/db';
import { db } from '@/utils/db';
import type { ProductImageValues } from '../schema/product-image.schema';

type Database = Kysely<DB> | Transaction<DB>;

export class ProductImageRepository {
  constructor(private readonly database: Database = db) {}

  withTransaction(trx: Transaction<DB>) {
    return new ProductImageRepository(trx);
  }

  createMany(values: ProductImageValues[]) {
    return this.database.insertInto('productImages').values(values).returningAll().execute();
  }

  /** Safe to call more than once for the same (productId, mediaId) pair - e.g. a retried job. */
  createIfNotExists(values: ProductImageValues) {
    return this.database
      .insertInto('productImages')
      .values(values)
      .onConflict((oc) => oc.columns(['productId', 'mediaId']).doNothing())
      .execute();
  }
}
