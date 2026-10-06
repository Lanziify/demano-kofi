import 'server-only';

import type { Kysely, Transaction } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/postgres';
import { typeSafeJsonArrayFrom } from '@/lib/db-helper';
import type { DB } from '@/types/db';
import { db } from '@/utils/db';
import type { ProductAddOnFormValues } from '../schema/add-on.schema';
import type { ProductValues } from '../schema/product.schema';
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
            .selectFrom('optionGroups as og')
            .select((ogEb) => [
              'og.id',
              'og.name',
              'og.minSelect',
              'og.maxSelect',
              'og.sortOrder',
              typeSafeJsonArrayFrom(
                ogEb
                  .selectFrom('options as o')
                  .select(['o.id', 'o.optionGroupId', 'o.name', 'o.priceAdjustment', 'o.isAvailable', 'o.sortOrder'])
                  .whereRef('o.optionGroupId', '=', 'og.id')
                  .orderBy('o.sortOrder', 'asc')
              ).as('options'),
            ])
            .whereRef('og.productId', '=', 'p.id')
            .orderBy('og.sortOrder', 'asc')
        ).as('optionGroups'),
        typeSafeJsonArrayFrom(
          eb
            .selectFrom('productAddOns as pao')
            .innerJoin('products as ap', 'ap.id', 'pao.addOnProductId')
            .select(['pao.addOnProductId', 'ap.name', 'ap.isAvailable', 'pao.priceAmount', 'pao.sortOrder'])
            .whereRef('pao.productId', '=', 'p.id')
            .orderBy('pao.sortOrder', 'asc')
        ).as('addOns'),
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
            .selectFrom('optionGroups as og')
            .select((ogEb) => [
              'og.id',
              'og.name',
              'og.minSelect',
              'og.maxSelect',
              'og.sortOrder',
              typeSafeJsonArrayFrom(
                ogEb
                  .selectFrom('options as o')
                  .select(['o.id', 'o.optionGroupId', 'o.name', 'o.priceAdjustment', 'o.isAvailable', 'o.sortOrder'])
                  .whereRef('o.optionGroupId', '=', 'og.id')
                  .orderBy('o.sortOrder', 'asc')
              ).as('options'),
            ])
            .whereRef('og.productId', '=', 'p.id')
            .orderBy('og.sortOrder', 'asc')
        ).as('optionGroups'),
        typeSafeJsonArrayFrom(
          eb
            .selectFrom('productAddOns as pao')
            .innerJoin('products as ap', 'ap.id', 'pao.addOnProductId')
            .select(['pao.addOnProductId', 'ap.name', 'ap.isAvailable', 'pao.priceAmount', 'pao.sortOrder'])
            .whereRef('pao.productId', '=', 'p.id')
            .orderBy('pao.sortOrder', 'asc')
        ).as('addOns'),
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

  /** Safe to call for both new and existing links - updates priceAmount/sortOrder in place. */
  async upsertManyAddOns(values: (ProductAddOnFormValues & { productId: string })[]) {
    if (values.length === 0) {
      return [];
    }

    return this.database
      .insertInto('productAddOns')
      .values(values)
      .onConflict((oc) =>
        oc.columns(['productId', 'addOnProductId']).doUpdateSet((eb) => ({
          priceAmount: eb.ref('excluded.priceAmount'),
          sortOrder: eb.ref('excluded.sortOrder'),
        }))
      )
      .returningAll()
      .execute();
  }

  async deleteAddOns(productId: string, addOnProductIds: string[]) {
    if (addOnProductIds.length === 0) {
      return [];
    }

    return this.database
      .deleteFrom('productAddOns')
      .where('productId', '=', productId)
      .where('addOnProductId', 'in', addOnProductIds)
      .execute();
  }
}
