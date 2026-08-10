import type { Kysely, Transaction } from 'kysely';
import type { DB } from '@/types/db';
import { db } from '@/utils/db';

type Database = Kysely<DB> | Transaction<DB>;

export type ProductCategoryModifierGroupLink = {
  productCategoryId: string;
  modifierGroupId: string;
};

export class ProductCategoryModifierGroupRepository {
  constructor(private readonly database: Database = db) {}

  withTransaction(trx: Transaction<DB>) {
    return new ProductCategoryModifierGroupRepository(trx);
  }

  async create(values: ProductCategoryModifierGroupLink, db = this.database) {
    return db
      .insertInto('productCategoryModifierGroups')
      .values(values)
      .returningAll()
      .executeTakeFirst();
  }

  async createMany(
    values: ProductCategoryModifierGroupLink[],
    db = this.database
  ) {
    return db
      .insertInto('productCategoryModifierGroups')
      .values(values)
      .returningAll()
      .execute();
  }

  async delete(productCategoryId: string, modifierGroupId: string) {
    return this.database
      .deleteFrom('productCategoryModifierGroups')
      .where(
        'productCategoryModifierGroups.productCategoryId',
        '=',
        productCategoryId
      )
      .where(
        'productCategoryModifierGroups.modifierGroupId',
        '=',
        modifierGroupId
      )
      .returningAll()
      .executeTakeFirst();
  }

  // Returns the linked modifier groups themselves, not the join rows.
  // async findByCategory(productCategoryId: string) {
  //   return this.database
  //     .selectFrom('productCategoryModifierGroups')
  //     .innerJoin(
  //       'productModifierGroups',
  //       'productModifierGroups.id',
  //       'productCategoryModifierGroups.modifierGroupId'
  //     )
  //     .selectAll('productModifierGroups')
  //     .where(
  //       'productCategoryModifierGroups.productCategoryId',
  //       '=',
  //       productCategoryId
  //     )
  //     .execute();
  // }
}
