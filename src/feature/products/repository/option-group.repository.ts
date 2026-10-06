import 'server-only';

import type { Insertable, Kysely, Transaction, Updateable } from 'kysely';
import type { DB, OptionGroups, Options } from '@/types/db';
import { db } from '@/utils/db';

type Database = Kysely<DB> | Transaction<DB>;

type OptionGroupInsert = Insertable<OptionGroups> & { productId: string };
type OptionGroupUpdate = Omit<Updateable<OptionGroups>, 'id' | 'productId' | 'createdAt' | 'updatedAt'>;
type OptionInsert = Insertable<Options> & { optionGroupId: string };
type OptionUpdate = Omit<Updateable<Options>, 'id' | 'optionGroupId' | 'createdAt' | 'updatedAt'>;

export class OptionGroupRepository {
  constructor(private readonly database: Database = db) {}

  withTransaction(trx: Transaction<DB>) {
    return new OptionGroupRepository(trx);
  }

  async createGroup(values: OptionGroupInsert) {
    return this.database.insertInto('optionGroups').values(values).returningAll().executeTakeFirst();
  }

  /** Scoped to `productId` so a group id from another product can never be touched. */
  async updateGroup(productId: string, id: string, values: OptionGroupUpdate) {
    return this.database
      .updateTable('optionGroups')
      .set(values)
      .where('productId', '=', productId)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  /** Options are removed with their group via `on delete cascade`. */
  async deleteGroupsByIds(productId: string, ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    return this.database.deleteFrom('optionGroups').where('productId', '=', productId).where('id', 'in', ids).execute();
  }

  async createManyOptions(values: OptionInsert[]) {
    return this.database.insertInto('options').values(values).returningAll().execute();
  }

  /** Scoped to `optionGroupId` so an option id from another group can never be touched. */
  async updateOption(optionGroupId: string, id: string, values: OptionUpdate) {
    return this.database
      .updateTable('options')
      .set(values)
      .where('optionGroupId', '=', optionGroupId)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  async deleteOptionsByIds(optionGroupId: string, ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    return this.database
      .deleteFrom('options')
      .where('optionGroupId', '=', optionGroupId)
      .where('id', 'in', ids)
      .execute();
  }
}
