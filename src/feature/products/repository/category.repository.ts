import type { Kysely, Transaction } from 'kysely';
import { db } from '@/core/db/db';
import type { DB } from '@/core/db/types';
import type { ProductCategoryFormValues } from '../schema/category.schema';

type Database = Kysely<DB> | Transaction<DB>;

export class CategoryRepository {
  constructor(private readonly database: Database = db) {}

  withTransaction(trx: Transaction<DB>) {
    return new CategoryRepository(trx);
  }

  async create(values: Omit<ProductCategoryFormValues, 'id'>) {
    return this.database.insertInto('productCategories').values(values).returningAll().executeTakeFirst();
  }

  async update({ id, ...values }: Omit<ProductCategoryFormValues, 'id'> & { id: string }) {
    return this.database
      .updateTable('productCategories')
      .set(values)
      .where('productCategories.id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  async findAll() {
    return this.database.selectFrom('productCategories').selectAll().execute();
  }

  async findById(id: string) {
    return this.database.selectFrom('productCategories').selectAll().where('productCategories.id', '=', id).executeTakeFirst();
  }
}
