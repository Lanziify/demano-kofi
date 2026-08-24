import type { Kysely, Transaction } from 'kysely';
import { typeSafeJsonArrayFrom } from '@/lib/db-helper';
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

  async findWithModifierGroupOptions() {
    return this.database
      .selectFrom('categories')
      .selectAll()
      .select((cmgeb) => [
        typeSafeJsonArrayFrom(
          cmgeb
            .selectFrom('categoryModifierGroups as cmg')
            .select('cmg.sortOrder')
            .innerJoin('modifierGroups as mg', 'mg.id', 'cmg.modifierGroupId')
            .select((mgeb) => [
              'mg.id',
              'mg.name',
              'mg.selectionType',
              typeSafeJsonArrayFrom(
                mgeb
                  .selectFrom('modifierGroupOptions as mgo')
                  .select([
                    'mgo.id',
                    'mgo.modifierGroupId',
                    'mgo.name',
                    'mgo.priceAdjustment',
                    'mgo.sortOrder',
                    'mgo.createdAt',
                    'mgo.updatedAt',
                  ])
                  .whereRef('mgo.modifierGroupId', '=', 'mg.id')
                  .orderBy('mgo.sortOrder', 'asc')
              ).as('options'),
              'mg.createdAt',
              'mg.updatedAt',
            ])
            .whereRef('cmg.categoryId', '=', 'categories.id')
        ).as('modifierGroups'),
      ])
      .execute();
  }

  async findOneWithModifierGroupOptions(id: string) {
    return this.database
      .selectFrom('categories')
      .selectAll()
      .select((cmgeb) => [
        typeSafeJsonArrayFrom(
          cmgeb
            .selectFrom('categoryModifierGroups as cmg')
            .select('cmg.sortOrder')
            .innerJoin('modifierGroups as mg', 'mg.id', 'cmg.modifierGroupId')
            .select((mgeb) => [
              'mg.id',
              'mg.name',
              'mg.selectionType',
              typeSafeJsonArrayFrom(
                mgeb
                  .selectFrom('modifierGroupOptions as mgo')
                  .select([
                    'mgo.id',
                    'mgo.modifierGroupId',
                    'mgo.name',
                    'mgo.priceAdjustment',
                    'mgo.sortOrder',
                    'mgo.createdAt',
                    'mgo.updatedAt',
                  ])
                  .whereRef('mgo.modifierGroupId', '=', 'mg.id')
                  .orderBy('mgo.sortOrder', 'asc')
              ).as('options'),
              'mg.createdAt',
              'mg.updatedAt',
            ])
            .whereRef('cmg.categoryId', '=', 'categories.id')
        ).as('modifierGroups'),
      ])
      .where('categories.id', '=', id)
      .executeTakeFirst();
  }
}
