import type { Kysely, Transaction } from 'kysely';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import type { DB } from '@/types/db';
import { db } from '@/utils/db';
import type { ProductCategorySchemaValue } from '../schema/product-category.schema';

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

  async create(values: ProductCategorySchemaValue, db = this.database) {
    return db
      .insertInto('productCategories')
      .values(values)
      .returningAll()
      .executeTakeFirst();
  }

  // async update(id: string, values: ProductCategorySchemaValue) {
  //   return this.database
  //     .updateTable('productCategories')
  //     .set(values)
  //     .where('productCategories.id', '=', id)
  //     .returningAll()
  //     .executeTakeFirst();
  // }

  // async delete(id: string) {
  //   return this.database
  //     .deleteFrom('productCategories')
  //     .where('productCategories.id', '=', id)
  //     .returningAll()
  //     .executeTakeFirst();
  // }

  async findAll() {
    return this.database.selectFrom('productCategories').selectAll().execute();
  }

  async findById(id: string) {
    return this.database
      .selectFrom('productCategories')
      .selectAll()
      .where('productCategories.id', '=', id)
      .executeTakeFirst();
  }

  async findWithGroups(id?: string) {
    const query = this.database
      .selectFrom('productCategories as pc')
      .selectAll('pc')
      .select((cmgeb) => [
        jsonArrayFrom(
          cmgeb
            .selectFrom('productCategoryModifierGroups as pcmg')
            .innerJoin(
              'productModifierGroups as pmg',
              'pmg.id',
              'pcmg.modifierGroupId'
            )
            .select([
              'pmg.id',
              'pmg.name',
              'pmg.isRequired',
              'pmg.selectionType',
              'pmg.createdAt',
              'pmg.updatedAt',
            ])
            .whereRef('pcmg.productCategoryId', '=', 'pc.id')
        ).as('modifierGroups'),
      ]);

    if (id) {
      return query.where('pc.id', '=', id).executeTakeFirst();
    }

    return query.execute();
  }

  async findWithGroupsModifiers(id?: string) {
    const query = this.database
      .selectFrom('productCategories as pc')
      .selectAll('pc')
      .select((cmgeb) => [
        jsonArrayFrom(
          cmgeb
            .selectFrom('productCategoryModifierGroups as pcmg')
            .innerJoin(
              'productModifierGroups as pmg',
              'pmg.id',
              'pcmg.modifierGroupId'
            )
            .select((mgeb) => [
              'pmg.id',
              'pmg.name',
              'pmg.isRequired',
              'pmg.selectionType',
              jsonArrayFrom(
                mgeb
                  .selectFrom('productModifiers as pm')
                  .select(['pm.id', 'pm.name', 'pm.priceAdjustment'])
                  .whereRef('pm.modifierGroupId', '=', 'pmg.id')
              ).as('modifiers'),
              'pmg.createdAt',
              'pmg.updatedAt',
            ])
            .whereRef('pcmg.productCategoryId', '=', 'pc.id')
        ).as('modifierGroups'),
      ]);

    if (id) {
      return query.where('pc.id', '=', id).executeTakeFirst();
    }

    return query.execute();
  }
}
