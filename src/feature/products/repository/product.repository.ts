import 'server-only';

import type { Kysely, Transaction } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/postgres';
import { typeSafeJsonArrayFrom } from '@/lib/db-helper';
import type { DB } from '@/types/db';
import { db } from '@/utils/db';
import type { ProductModifierGroupValues, ProductModifierOptionValues, ProductValues } from '../schema/product.schema';
import type { ProductImageValues } from '../schema/product-image.schema';
import type { VariantFormValues } from '../schema/variants.schema';

type Database = Kysely<DB> | Transaction<DB>;

export class ProductRepository {
  constructor(private readonly database: Database = db) {}

  withTransaction(trx: Transaction<DB>) {
    return new ProductRepository(trx);
  }

  async findAll() {
    return this.database
      .selectFrom('products as p')
      .select((eb) => [
        'p.id',
        'p.name',
        'p.description',
        'p.isAvailable',
        'p.isFeatured',
        jsonObjectFrom(
          eb
            .selectFrom('categories as c')
            .select(['c.id', 'c.name', 'c.description'])
            .whereRef('c.id', '=', 'p.categoryId')
        ).as('category'),
        typeSafeJsonArrayFrom(
          eb
            .selectFrom('productImages as pi')
            .innerJoin('media as m', 'm.id', 'pi.mediaId')
            .selectAll('m')
            .select(['pi.altText', 'pi.sortOrder'])
            .whereRef('pi.productId', '=', 'p.id')
            .orderBy('m.type', 'asc')
            .orderBy('pi.sortOrder', 'asc')
        ).as('images'),
        typeSafeJsonArrayFrom(
          eb
            .selectFrom('variants as v')
            .selectAll(['v'])
            .whereRef('v.productId', '=', 'p.id')
            .orderBy('v.sortOrder', 'asc')
        ).as('variants'),
        typeSafeJsonArrayFrom(
          eb
            .selectFrom('productModifierGroups as pmg')
            .innerJoin('modifierGroups as mg', 'mg.id', 'pmg.modifierGroupId')
            .select([
              'mg.id',
              'mg.name',
              'mg.selectionType',
              'pmg.isRequired',
              typeSafeJsonArrayFrom(
                eb
                  .selectFrom('productModifierOptions as pmo')
                  .innerJoin('modifierGroupOptions as mgo', 'mgo.id', 'pmo.modifierOptionId')
                  .select([
                    'mgo.id',
                    'mgo.modifierGroupId',
                    'mgo.name',
                    'pmo.priceAdjustment', // using price adjustment from product
                    'pmo.sortOrder', // using sort order from product
                    'mgo.createdAt',
                    'mgo.updatedAt',
                  ])
                  .orderBy('pmo.sortOrder', 'asc')
              ).as('options'),
              'pmg.sortOrder',
              'mg.createdAt',
              'mg.updatedAt',
            ])
            .orderBy('pmg.sortOrder', 'asc')
            .whereRef('pmg.productId', '=', 'p.id')
        ).as('modifierGroups'),
        'p.createdAt',
        'p.updatedAt',
      ])
      .orderBy('p.createdAt', 'desc')
      .execute();
  }

  async findById(id: string) {
    return this.database
      .selectFrom('products as p')
      .select((eb) => [
        'p.id',
        'p.name',
        'p.description',
        'p.isAvailable',
        'p.isFeatured',
        jsonObjectFrom(
          eb
            .selectFrom('categories as c')
            .select(['c.id', 'c.name', 'c.description'])
            .whereRef('c.id', '=', 'p.categoryId')
        ).as('category'),
        typeSafeJsonArrayFrom(
          eb
            .selectFrom('productImages as pi')
            .innerJoin('media as m', 'm.id', 'pi.mediaId')
            .selectAll('m')
            .select(['pi.altText', 'pi.sortOrder'])
            .whereRef('pi.productId', '=', 'p.id')
            .orderBy('m.type', 'asc')
            .orderBy('pi.sortOrder', 'asc')
        ).as('images'),
        typeSafeJsonArrayFrom(
          eb
            .selectFrom('variants as v')
            .selectAll(['v'])
            .whereRef('v.productId', '=', 'p.id')
            .orderBy('v.sortOrder', 'asc')
        ).as('variants'),
        typeSafeJsonArrayFrom(
          eb
            .selectFrom('productModifierGroups as pmg')
            .innerJoin('modifierGroups as mg', 'mg.id', 'pmg.modifierGroupId')
            .select([
              'mg.id',
              'mg.name',
              'mg.selectionType',
              'pmg.isRequired',
              typeSafeJsonArrayFrom(
                eb
                  .selectFrom('productModifierOptions as pmo')
                  .innerJoin('modifierGroupOptions as mgo', 'mgo.id', 'pmo.modifierOptionId')
                  .select([
                    'mgo.id',
                    'mgo.modifierGroupId',
                    'mgo.name',
                    'pmo.priceAdjustment', // using price adjustment from product
                    'pmo.sortOrder', // using sort order from product
                    'mgo.createdAt',
                    'mgo.updatedAt',
                  ])
                  .orderBy('pmo.sortOrder', 'asc')
              ).as('options'),
              'pmg.sortOrder',
              'mg.createdAt',
              'mg.updatedAt',
            ])
            .orderBy('pmg.sortOrder', 'asc')
            .whereRef('pmg.productId', '=', 'p.id')
        ).as('modifierGroups'),
        'p.createdAt',
        'p.updatedAt',
      ])
      .where('p.id', '=', id)
      .orderBy('p.createdAt', 'desc')
      .executeTakeFirst();
  }

  async create(values: Omit<ProductValues, 'createdAt' | 'updatedAt'>) {
    return this.database.insertInto('products').values(values).returningAll().executeTakeFirst();
  }

  async createManyImages(values: ProductImageValues[]) {
    return this.database.insertInto('productImages').values(values).returningAll().execute();
  }

  async createManyVariant(
    values: (Omit<VariantFormValues, 'id' | 'productId' | 'priceAmount'> & { productId: string; priceAmount: number })[]
  ) {
    return this.database.insertInto('variants').values(values).returningAll().execute();
  }

  async createManyModifierGroup(
    values: (Omit<ProductModifierGroupValues, 'categoryModifierGroupId'> & { categoryModifierGroupId: string | null })[]
  ) {
    return this.database.insertInto('productModifierGroups').values(values).returningAll().execute();
  }

  async createModifierOption(values: ProductModifierOptionValues) {
    return this.database.insertInto('productModifierOptions').values(values).execute();
  }

  async createManyModifierOption(values: ProductModifierOptionValues[]) {
    return this.database.insertInto('productModifierOptions').values(values).execute();
  }
}
