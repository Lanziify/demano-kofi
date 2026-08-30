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
            .select((mgEb) => [
              'mg.id',
              'mg.name',
              mgEb.fn.coalesce('pmg.selectionType', 'mg.selectionType').as('selectionType'),
              'pmg.categoryModifierGroupId',
              'pmg.isRequired',
              typeSafeJsonArrayFrom(
                mgEb
                  .selectFrom('productModifierOptions as pmo')
                  .innerJoin('modifierGroupOptions as mgo', 'mgo.id', 'pmo.modifierOptionId')
                  .select([
                    'mgo.id',
                    'mgo.modifierGroupId',
                    'mgo.name',
                    'mgo.productId', // null = shared/template option, else private to this product
                    'pmo.priceAdjustment', // using price adjustment from product
                    'pmo.sortOrder', // using sort order from product
                    'mgo.createdAt',
                    'mgo.updatedAt',
                  ])
                  .whereRef('pmo.modifierGroupId', '=', 'mg.id')
                  .whereRef('pmo.productId', '=', 'p.id')
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
            .select((mgEb) => [
              'mg.id',
              'mg.name',
              mgEb.fn.coalesce('pmg.selectionType', 'mg.selectionType').as('selectionType'),
              'pmg.categoryModifierGroupId',
              'pmg.isRequired',
              typeSafeJsonArrayFrom(
                mgEb
                  .selectFrom('productModifierOptions as pmo')
                  .innerJoin('modifierGroupOptions as mgo', 'mgo.id', 'pmo.modifierOptionId')
                  .select([
                    'mgo.id',
                    'mgo.modifierGroupId',
                    'mgo.name',
                    'mgo.productId', // null = shared/template option, else private to this product
                    'pmo.priceAdjustment', // using price adjustment from product
                    'pmo.sortOrder', // using sort order from product
                    'mgo.createdAt',
                    'mgo.updatedAt',
                  ])
                  .whereRef('pmo.modifierGroupId', '=', 'mg.id')
                  .whereRef('pmo.productId', '=', 'p.id')
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

  async update(id: string, values: Partial<Omit<ProductValues, 'id' | 'createdAt' | 'updatedAt'>>) {
    return this.database.updateTable('products').set(values).where('id', '=', id).returningAll().executeTakeFirst();
  }

  async createManyImages(values: ProductImageValues[]) {
    return this.database.insertInto('productImages').values(values).returningAll().execute();
  }

  /** Safe to call for both a new image link and an existing one - updates altText/sortOrder in place. */
  async upsertImage(values: ProductImageValues) {
    return this.database
      .insertInto('productImages')
      .values(values)
      .onConflict((oc) =>
        oc.columns(['productId', 'mediaId']).doUpdateSet({ altText: values.altText, sortOrder: values.sortOrder })
      )
      .returningAll()
      .executeTakeFirst();
  }

  async deleteImagesByMediaIds(productId: string, mediaIds: string[]) {
    if (mediaIds.length === 0) {
      return [];
    }

    return this.database
      .deleteFrom('productImages')
      .where('productId', '=', productId)
      .where('mediaId', 'in', mediaIds)
      .execute();
  }

  async createManyVariant(
    values: (Omit<VariantFormValues, 'id' | 'productId' | 'priceAmount'> & { productId: string; priceAmount: number })[]
  ) {
    return this.database.insertInto('variants').values(values).returningAll().execute();
  }

  async createVariant(
    values: Omit<VariantFormValues, 'id' | 'productId' | 'priceAmount'> & { productId: string; priceAmount: number }
  ) {
    return this.database.insertInto('variants').values(values).returningAll().executeTakeFirst();
  }

  async updateVariant(
    id: string,
    values: Omit<VariantFormValues, 'id' | 'productId' | 'priceAmount'> & { priceAmount: number }
  ) {
    return this.database.updateTable('variants').set(values).where('id', '=', id).returningAll().executeTakeFirst();
  }

  async deleteVariantsByIds(productId: string, ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    return this.database.deleteFrom('variants').where('productId', '=', productId).where('id', 'in', ids).execute();
  }

  async createManyModifierGroup(
    values: (Omit<ProductModifierGroupValues, 'categoryModifierGroupId'> & { categoryModifierGroupId: string | null })[]
  ) {
    return this.database.insertInto('productModifierGroups').values(values).returningAll().execute();
  }

  /** Safe to call for both a new group link and an existing one - updates isRequired/sortOrder in place. */
  async upsertModifierGroup(
    values: Omit<ProductModifierGroupValues, 'categoryModifierGroupId'> & { categoryModifierGroupId: string | null }
  ) {
    return this.database
      .insertInto('productModifierGroups')
      .values(values)
      .onConflict((oc) =>
        oc.columns(['productId', 'modifierGroupId']).doUpdateSet({
          categoryModifierGroupId: values.categoryModifierGroupId,
          isRequired: values.isRequired,
          sortOrder: values.sortOrder,
          selectionType: values.selectionType,
        })
      )
      .returningAll()
      .executeTakeFirst();
  }

  async deleteModifierGroup(productId: string, modifierGroupId: string) {
    return this.database
      .deleteFrom('productModifierGroups')
      .where('productId', '=', productId)
      .where('modifierGroupId', '=', modifierGroupId)
      .execute();
  }

  async createModifierOption(values: ProductModifierOptionValues) {
    return this.database.insertInto('productModifierOptions').values(values).execute();
  }

  async createManyModifierOption(values: ProductModifierOptionValues[]) {
    return this.database.insertInto('productModifierOptions').values(values).execute();
  }

  /** Safe to call for both a new option override and an existing one - updates priceAdjustment/sortOrder in place. */
  async upsertModifierOption(values: ProductModifierOptionValues) {
    return this.database
      .insertInto('productModifierOptions')
      .values(values)
      .onConflict((oc) =>
        oc
          .columns(['productId', 'modifierGroupId', 'modifierOptionId'])
          .doUpdateSet({ priceAdjustment: values.priceAdjustment, sortOrder: values.sortOrder })
      )
      .execute();
  }

  async deleteModifierOptionsByGroup(productId: string, modifierGroupId: string) {
    return this.database
      .deleteFrom('productModifierOptions')
      .where('productId', '=', productId)
      .where('modifierGroupId', '=', modifierGroupId)
      .execute();
  }

  async deleteModifierOption(productId: string, modifierGroupId: string, modifierOptionId: string) {
    return this.database
      .deleteFrom('productModifierOptions')
      .where('productId', '=', productId)
      .where('modifierGroupId', '=', modifierGroupId)
      .where('modifierOptionId', '=', modifierOptionId)
      .execute();
  }
}
