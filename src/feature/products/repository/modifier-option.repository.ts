import type { Kysely, Transaction } from 'kysely';
import type { DB } from '@/types/db';
import { db } from '@/utils/db';
import type { ModifierGroupOptionFormValues } from '../schema/modifier.schema';

type Database = Kysely<DB> | Transaction<DB>;

export class ModifierGroupOptionRepository {
  constructor(private readonly database: Database = db) {}

  withTransaction(trx: Transaction<DB>) {
    return new ModifierGroupOptionRepository(trx);
  }

  /** `productId` left unset (or null) creates a shared/template option; a real id creates one private to that product. */
  async create(
    values: Omit<ModifierGroupOptionFormValues, 'id' | 'modifierGroupId'> & {
      modifierGroupId: string;
      productId?: string | null;
    }
  ) {
    return this.database.insertInto('modifierGroupOptions').values(values).returningAll().executeTakeFirst();
  }

  async createMany(
    values: (Omit<ModifierGroupOptionFormValues, 'id' | 'modifierGroupId'> & {
      modifierGroupId: string;
      productId?: string | null;
    })[]
  ) {
    return this.database.insertInto('modifierGroupOptions').values(values).returningAll().execute();
  }

  async update({ id, ...values }: Omit<ModifierGroupOptionFormValues, 'id'> & { id: string }) {
    return this.database
      .updateTable('modifierGroupOptions')
      .set(values)
      .where('modifierGroupOptions.id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  async delete(modifierGroupId: string, id: string) {
    return this.database
      .deleteFrom('modifierGroupOptions')
      .where('modifierGroupOptions.id', '=', id)
      .where('modifierGroupOptions.modifierGroupId', '=', modifierGroupId)
      .returningAll()
      .executeTakeFirst();
  }
}
