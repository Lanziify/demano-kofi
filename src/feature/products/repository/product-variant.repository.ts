import type { Kysely, Transaction } from 'kysely';
import type { DB } from '@/types/db';
import { db } from '@/utils/db';
import type { ProductVariantSchemaValue } from '../schema/product-variant.schema';

type Database = Kysely<DB> | Transaction<DB>;

export class ProductVariantRepository {
  constructor(private readonly database: Database = db) {}

  withTransaction(trx: Transaction<DB>) {
    return new ProductVariantRepository(trx);
  }

  async create(values: ProductVariantSchemaValue) {
    return this.database
      .insertInto('productVariants')
      .values(values)
      .returningAll()
      .executeTakeFirst();
  }

  async createMany(values: ProductVariantSchemaValue[], db = this.database) {
    return db
      .insertInto('productVariants')
      .values(values)
      .returningAll()
      .executeTakeFirst();
  }

  // async update(
  //   productId: string,
  //   id: string,
  //   values: ProductVariantSchemaValues
  // ) {
  //   return this.database
  //     .updateTable('productVariants')
  //     .set(values)
  //     .where('productVariants.id', '=', id)
  //     .where('productVariants.productId', '=', productId)
  //     .returningAll()
  //     .executeTakeFirst();
  // }

  // async delete(productId: string, id: string) {
  //   return this.database
  //     .deleteFrom('productVariants')
  //     .where('productVariants.id', '=', id)
  //     .where('productVariants.productId', '=', productId)
  //     .returningAll()
  //     .executeTakeFirst();
  // }

  // async findById(productId: string, id: string) {
  //   return this.database
  //     .selectFrom('productVariants')
  //     .selectAll()
  //     .where('productVariants.id', '=', id)
  //     .where('productVariants.productId', '=', productId)
  //     .executeTakeFirst();
  // }

  // async findByProduct(productId: string) {
  //   return this.database
  //     .selectFrom('productVariants')
  //     .selectAll()
  //     .where('productVariants.productId', '=', productId)
  //     .orderBy('productVariants.createdAt', 'desc')
  //     .execute();
  // }
}
