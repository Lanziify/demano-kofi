import type { Kysely, Transaction } from 'kysely';
import type { DB } from '@/types/db';
import { db } from '@/utils/db';
import type { ProductImageSchemaValue } from '../schema/product-image.schema';

type Database = Kysely<DB> | Transaction<DB>;

export class ProductImageRepository {
  constructor(private readonly database: Database = db) {}

  withTransaction(trx: Transaction<DB>) {
    return new ProductImageRepository(trx);
  }

  createMany(values: ProductImageSchemaValue[]) {
    return this.database
      .insertInto('productImages')
      .values(values)
      .returningAll()
      .execute();
  }

  // async create(values: ProductImageSchemaValues) {
  //   return this.database
  //     .insertInto('productImages')
  //     .values(values)
  //     .returningAll()
  //     .executeTakeFirst();
  // }

  // async delete(productId: string, id: string) {
  //   return this.database
  //     .deleteFrom('productImages')
  //     .where('productImages.id', '=', id)
  //     .where('productImages.productId', '=', productId)
  //     .returningAll()
  //     .executeTakeFirst();
  // }

  // async findById(productId: string, id: string) {
  //   return this.database
  //     .selectFrom('productImages')
  //     .selectAll()
  //     .where('productImages.id', '=', id)
  //     .where('productImages.productId', '=', productId)
  //     .executeTakeFirst();
  // }

  // async findByProduct(productId: string) {
  //   return this.database
  //     .selectFrom('productImages')
  //     .selectAll()
  //     .where('productImages.productId', '=', productId)
  //     .execute();
  // }
}
