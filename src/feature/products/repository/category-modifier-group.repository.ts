import type { Kysely, Transaction } from 'kysely';
import type { DB } from '@/types/db';
import { db } from '@/utils/db';
import type { CategoryModifierGroupWithoutIdValues } from '../schema/category.schema';

type Database = Kysely<DB> | Transaction<DB>;

export class CategoryModifierGroupRepository {
  constructor(private readonly database: Database = db) {}

  withTransaction(trx: Transaction<DB>) {
    return new CategoryModifierGroupRepository(trx);
  }

  async create(values: CategoryModifierGroupWithoutIdValues) {
    return this.database.insertInto('categoryModifierGroups').values(values).returningAll().executeTakeFirst();
  }

  async createMany(values: CategoryModifierGroupWithoutIdValues[]) {
    return this.database.insertInto('categoryModifierGroups').values(values).returningAll().execute();
  }

  async delete(categoryId: string, modifierGroupId: string) {
    return this.database
      .deleteFrom('categoryModifierGroups')
      .where('categoryModifierGroups.categoryId', '=', categoryId)
      .where('categoryModifierGroups.modifierGroupId', '=', modifierGroupId)
      .returningAll()
      .executeTakeFirst();
  }

  async findAllById(id: string) {
    return this.database
      .selectFrom('categoryModifierGroups')
      .selectAll()
      .where('categoryModifierGroups.categoryId', '=', id)
      .execute();
  }
}
