import type { Kysely, Transaction } from 'kysely';
import type { DB } from '@/types/db';
import { db } from '@/utils/db';
import type { ProductSchemaValue } from '../schema/product.schema';

type Database = Kysely<DB> | Transaction<DB>;

export type FindManyProductsOptions = {
  page?: number;
  pageSize?: number;
};

export class ProductRepository {
  constructor(private readonly database: Database = db) {}

  withTransaction(trx: Transaction<DB>) {
    return new ProductRepository(trx);
  }

  async create(values: ProductSchemaValue) {
    return this.database
      .insertInto('products')
      .values(values)
      .returningAll()
      .executeTakeFirst();
  }

  // async update(id: string, values: ProductSchemaValues) {
  //   return this.database
  //     .updateTable('products')
  //     .set(values)
  //     .where('products.id', '=', id)
  //     .returningAll()
  //     .executeTakeFirst();
  // }

  // async delete(id: string) {
  //   return this.database
  //     .deleteFrom('products')
  //     .where('products.id', '=', id)
  //     .returningAll()
  //     .executeTakeFirst();
  // }

  // async findById(id: string) {
  //   return this.database
  //     .selectFrom('products')
  //     .selectAll()
  //     .where('products.id', '=', id)
  //     .executeTakeFirst();
  // }

  // async findAll() {
  //   return this.database.selectFrom('products').selectAll().execute();
  // }

  // async findMany({ page = 1, pageSize = 10 }: FindManyProductsOptions) {
  //   const [data, totalRow] = await Promise.all([
  //     this.database
  //       .selectFrom('products')
  //       .selectAll()
  //       .limit(pageSize)
  //       .offset((page - 1) * pageSize)
  //       .orderBy('products.createdAt', 'desc')
  //       .execute(),
  //     this.database
  //       .selectFrom('products')
  //       .select(sql<string>`count(*)`.as('total'))
  //       .executeTakeFirstOrThrow(),
  //   ]);

  //   return {
  //     data,
  //     page,
  //     pageSize,
  //     total: Number(totalRow.total),
  //   };
  // }
}
