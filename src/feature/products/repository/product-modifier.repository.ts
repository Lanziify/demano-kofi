import type { Kysely, Transaction } from 'kysely';
import type { DB } from '@/types/db';
import { db } from '@/utils/db';
import type { CreateModifierSchemaValue } from '../schema/product-modifier.schema';

type Database = Kysely<DB> | Transaction<DB>;

type ProductModifierInsert = CreateModifierSchemaValue & {
  modifierGroupId: string;
};

export class ProductModifierRepository {
  constructor(private readonly database: Database = db) {}

  withTransaction(trx: Transaction<DB>) {
    return new ProductModifierRepository(trx);
  }

  async create(values: ProductModifierInsert, db = this.database) {
    return db
      .insertInto('productModifiers')
      .values(values)
      .returningAll()
      .executeTakeFirst();
  }

  async createMany(values: ProductModifierInsert[], db = this.database) {
    return db
      .insertInto('productModifiers')
      .values(values)
      .returningAll()
      .execute();
  }

  // async update(
  //   modifierGroupId: string,
  //   id: string,
  //   values: CreateModifierSchemaValue
  // ) {
  //   return this.database
  //     .updateTable('productModifiers')
  //     .set(values)
  //     .where('productModifiers.id', '=', id)
  //     .where('productModifiers.modifierGroupId', '=', modifierGroupId)
  //     .returningAll()
  //     .executeTakeFirst();
  // }

  // async delete(modifierGroupId: string, id: string) {
  //   return this.database
  //     .deleteFrom('productModifiers')
  //     .where('productModifiers.id', '=', id)
  //     .where('productModifiers.modifierGroupId', '=', modifierGroupId)
  //     .returningAll()
  //     .executeTakeFirst();
  // }

  // async findById(modifierGroupId: string, id: string) {
  //   return this.database
  //     .selectFrom('productModifiers')
  //     .selectAll()
  //     .where('productModifiers.id', '=', id)
  //     .where('productModifiers.modifierGroupId', '=', modifierGroupId)
  //     .executeTakeFirst();
  // }

  // async findByModifierGroup(modifierGroupId: string) {
  //   return this.database
  //     .selectFrom('productModifiers')
  //     .selectAll()
  //     .where('productModifiers.modifierGroupId', '=', modifierGroupId)
  //     .execute();
  // }
}
