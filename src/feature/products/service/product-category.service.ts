import type { Transaction } from 'kysely';
import { DatabaseError } from '@/lib/errors/app-error';
import type { DB } from '@/types/db';
import { db } from '@/utils/db';
import { ProductCategoryRepository } from '../repository/product-category.repository';
import { ProductCategoryModifierGroupRepository } from '../repository/product-category-modifier-group.repository';
import { ProductModifierRepository } from '../repository/product-modifier.repository';
import { ProductModifierGroupRepository } from '../repository/product-modifier-group.repository';
import type { CreateProductCategorySchemaValue } from '../schema/product-category.schema';

export class ProductCategoryService {
  constructor(
    private readonly productCategoryRepository = new ProductCategoryRepository(),
    private readonly productModifierGroupRepository = new ProductModifierGroupRepository(),
    private readonly productModifierRepository = new ProductModifierRepository(),
    private readonly productCategoryModifierGroupRepository = new ProductCategoryModifierGroupRepository()
  ) {}

  async createCategory(
    values: CreateProductCategorySchemaValue,
    trx?: Transaction<DB>
  ) {
    const run = async (trx: Transaction<DB>) => {
      const { modifierGroupIds, modifierGroups, ...categoryData } = values;

      const categoryRepo = this.productCategoryRepository.withTransaction(trx);
      const groupRepo = this.productModifierGroupRepository.withTransaction(trx);
      const modifierRepo = this.productModifierRepository.withTransaction(trx);
      const linkRepo = this.productCategoryModifierGroupRepository.withTransaction(trx);

      const category = await categoryRepo.create(categoryData);

      if (!category) {
        throw new DatabaseError(
          'An error has occurred while trying to store category'
        );
      }

      const links: { productCategoryId: string; modifierGroupId: string }[] = (
        modifierGroupIds ?? []
      ).map((modifierGroupId) => ({
        productCategoryId: category.id,
        modifierGroupId,
      }));

      for (const { modifiers, ...groupData } of modifierGroups ?? []) {
        const group = await groupRepo.create(groupData);

        if (!group) {
          throw new DatabaseError(
            'An error has occurred while trying to store modifier group'
          );
        }

        if (modifiers.length > 0) {
          await modifierRepo.createMany(
            modifiers.map((modifier) => ({
              ...modifier,
              modifierGroupId: group.id,
            }))
          );
        }

        links.push({
          productCategoryId: category.id,
          modifierGroupId: group.id,
        });
      }

      if (links.length > 0) {
        await linkRepo.createMany(links);
      }

      return category;
    };

    return trx ? run(trx) : db.transaction().execute(run);
  }

  // async updateCategory(id: string, values: ProductCategorySchemaValues) {
  //   const category = await this.repository.update(id, values);

  //   if (!category) {
  //     throw new NotFoundError('Category not found', {
  //       errorCode: 'CATEGORY_NOT_FOUND',
  //     });
  //   }

  //   return category;
  // }

  // async deleteCategory(id: string) {
  //   const category = await this.repository.delete(id);

  //   if (!category) {
  //     throw new NotFoundError('Category not found', {
  //       errorCode: 'CATEGORY_NOT_FOUND',
  //     });
  //   }

  //   return category;
  // }

  // async getCategory(id: string) {
  //   const category = await this.repository.findById(id);

  //   if (!category) {
  //     throw new NotFoundError('Category not found', {
  //       errorCode: 'CATEGORY_NOT_FOUND',
  //     });
  //   }

  //   return category;
  // }

  // async getAllCategories() {
  //   return await this.repository.findAll();
  // }

  // async getCategories(options: FindManyCategoriesOptions) {
  //   return await this.repository.findMany(options);
  // }
}
