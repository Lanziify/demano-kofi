import type { Kysely, Transaction } from 'kysely';
import { db } from '@/core/db/db';
import type { DB } from '@/core/db/types';
import type { InventoryCategoryFormValues } from '../schema/category.schema';

type Database = Kysely<DB> | Transaction<DB>;

export class InventoryCategoryRepository {
  constructor(private readonly database: Database = db) {}

  withTransaction(trx: Transaction<DB>) {
    return new InventoryCategoryRepository(trx);
  }

  async create(values: InventoryCategoryFormValues) {
    return this.database.insertInto('inventoryCategories').values(values).returningAll().executeTakeFirst();
  }

  async update({ id, ...values }: Omit<InventoryCategoryFormValues, 'id'> & { id: string }) {
    return this.database
      .updateTable('inventoryCategories')
      .set(values)
      .where('inventoryCategories.id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  async findAll() {
    return this.database.selectFrom('inventoryCategories').selectAll().execute();
  }

  async findById(id: string) {
    return this.database
      .selectFrom('inventoryCategories')
      .selectAll()
      .where('inventoryCategories.id', '=', id)
      .executeTakeFirst();
  }
}
