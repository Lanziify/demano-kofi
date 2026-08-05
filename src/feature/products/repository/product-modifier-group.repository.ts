import type { Kysely, Transaction } from 'kysely';
import type { DB } from '@/types/db';
import { db } from '@/utils/db';
import type { ProductModifierGroupSchemaValue } from '../schema/product-modifier-group.schema';

type Database = Kysely<DB> | Transaction<DB>;

export type FindManyModifierGroupsOptions = {
  page?: number;
  pageSize?: number;
};

export class ProductModifierGroupRepository {
  constructor(private readonly database: Database = db) {}

  withTransaction(trx: Transaction<DB>) {
    return new ProductModifierGroupRepository(trx);
  }

  async create(values: ProductModifierGroupSchemaValue, db = this.database) {
    return db
      .insertInto('productModifierGroups')
      .values(values)
      .returningAll()
      .executeTakeFirst();
  }

  // async update(id: string, values: ProductModifierGroupSchemaValue) {
  //   return this.database
  //     .updateTable('productModifierGroups')
  //     .set(values)
  //     .where('productModifierGroups.id', '=', id)
  //     .returningAll()
  //     .executeTakeFirst();
  // }

  // async delete(id: string) {
  //   return this.database
  //     .deleteFrom('productModifierGroups')
  //     .where('productModifierGroups.id', '=', id)
  //     .returningAll()
  //     .executeTakeFirst();
  // }

  // async findById(id: string) {
  //   return this.database
  //     .selectFrom('productModifierGroups')
  //     .selectAll()
  //     .where('productModifierGroups.id', '=', id)
  //     .executeTakeFirst();
  // }

  // async findAll() {
  //   return this.database
  //     .selectFrom('productModifierGroups')
  //     .selectAll()
  //     .execute();
  // }

  // async findMany({ page = 1, pageSize = 10 }: FindManyModifierGroupsOptions) {
  //   const [data, totalRow] = await Promise.all([
  //     this.database
  //       .selectFrom('productModifierGroups')
  //       .selectAll()
  //       .limit(pageSize)
  //       .offset((page - 1) * pageSize)
  //       .orderBy('productModifierGroups.createdAt', 'desc')
  //       .execute(),
  //     this.database
  //       .selectFrom('productModifierGroups')
  //       .select(sql<string>`count(*)`.as('total'))
  //       .executeTakeFirstOrThrow(),
  //   ]);

  //   return {
  //     data,
  //     page,
  //     pageSize,
  //     total: Number(totalRow.total),
  //   };
  // }
}
