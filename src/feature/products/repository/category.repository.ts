import type { Kysely, Transaction } from 'kysely';
import type { DB } from '@/types/db';
import { db } from '@/utils/db';
import type { CategoryFormValues } from '../schema/category.schema';

type Database = Kysely<DB> | Transaction<DB>;

export class CategoryRepository {
  constructor(private readonly database: Database = db) {}

  withTransaction(trx: Transaction<DB>) {
    return new CategoryRepository(trx);
  }

  async create(values: Omit<CategoryFormValues, 'id'>) {
    return this.database.insertInto('categories').values(values).returningAll().executeTakeFirst();
  }

  async update({ id, ...values }: Omit<CategoryFormValues, 'id'> & { id: string }) {
    return this.database
      .updateTable('categories')
      .set(values)
      .where('categories.id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  async findAll() {
    return this.database.selectFrom('categories').selectAll().execute();
  }

  async findById(id: string) {
    return this.database.selectFrom('categories').selectAll().where('categories.id', '=', id).executeTakeFirst();
  }
}
