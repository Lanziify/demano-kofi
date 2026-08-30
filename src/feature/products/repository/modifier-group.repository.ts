import type { Kysely, Transaction } from 'kysely';
import type { DB } from '@/types/db';
import { db } from '@/utils/db';
import type { ModifierGroupFormValues } from '../schema/modifier.schema';

type Database = Kysely<DB> | Transaction<DB>;

export class ModifierGroupRepository {
  constructor(private readonly database: Database = db) {}

  withTransaction(trx: Transaction<DB>) {
    return new ModifierGroupRepository(trx);
  }

  async create(values: Omit<ModifierGroupFormValues, 'id'>) {
    return this.database.insertInto('modifierGroups').values(values).returningAll().executeTakeFirst();
  }

  async update({ id, ...values }: Omit<ModifierGroupFormValues, 'id'> & { id: string }) {
    return this.database
      .updateTable('modifierGroups')
      .set(values)
      .where('modifierGroups.id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(id: string) {
    return this.database.deleteFrom('modifierGroups').where('modifierGroups.id', '=', id).execute();
  }
}
