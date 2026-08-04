import { type Kysely, sql, type Transaction } from 'kysely';
import type { DB } from '@/types/db';
import { db } from '@/utils/db';
import type { ProductCategorySchemaValues } from '../schema/schema';

type Database = Kysely<DB> | Transaction<DB>;

export type FindManyCategoriesOptions = {
  page?: number;
  pageSize?: number;
};

export class ProductCategoryRepository {
  constructor(private readonly database: Database = db) {}

  withTransaction(trx: Transaction<DB>) {
    return new ProductCategoryRepository(trx);
  }

  async create(values: ProductCategorySchemaValues) {
    return this.database
      .insertInto('productCategories')
      .values(values)
      .returningAll()
      .executeTakeFirst();
  }

  async update(id: string, values: ProductCategorySchemaValues) {
    return this.database
      .updateTable('productCategories')
      .set(values)
      .where('productCategories.id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(id: string) {
    return this.database
      .deleteFrom('productCategories')
      .where('productCategories.id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  async findById(id: string) {
    return this.database
      .selectFrom('productCategories')
      .selectAll()
      .where('productCategories.id', '=', id)
      .executeTakeFirst();
  }

  async findAll() {
    return this.database.selectFrom('productCategories').selectAll().execute();
  }

  async findMany({ page = 1, pageSize = 10 }: FindManyCategoriesOptions) {
    const [data, totalRow] = await Promise.all([
      this.database
        .selectFrom('productCategories')
        .selectAll()
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .orderBy('productCategories.createdAt', 'desc')
        .execute(),
      this.database
        .selectFrom('productCategories')
        .select(sql<string>`count(*)`.as('total'))
        .executeTakeFirstOrThrow(),
    ]);

    return {
      data,
      page,
      pageSize,
      total: Number(totalRow.total),
    };
  }
}
