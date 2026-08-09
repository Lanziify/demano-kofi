import type { Transaction } from 'kysely';
import { DatabaseError } from '@/lib/errors/app-error';
import type {
  DB,
  ProductCategories,
  ProductModifierGroups,
  ProductModifiers,
} from '@/types/db';
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
      const groupRepo =
        this.productModifierGroupRepository.withTransaction(trx);
      const modifierRepo = this.productModifierRepository.withTransaction(trx);
      const linkRepo =
        this.productCategoryModifierGroupRepository.withTransaction(trx);

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

  async getCategories() {
    return await this.productCategoryRepository.findAll();
  }

  async getCategoryById(id: string) {
    return await this.productCategoryRepository.findById(id);
  }

  async getCategoriesWithGroups(id?: string) {
    return await this.productCategoryRepository.findWithGroups(id);
  }

  async getCategoriesWithGroupsModifiers(id?: string) {
    return await this.productCategoryRepository.findWithGroupsModifiers(id);
  }
}

export type ProductCategory = ProductCategories;

export type ProductCategoryWithGroups = (
  ProductCategory & {
    modifierGroups: ProductModifierGroups[];
  }
)[];

export type ProductCategoryWithGroupsModifiers = (
  ProductCategory & {
    modifierGroups: (
      ProductModifierGroups & {
        modifiers: ProductModifiers[];
      }
    )[];
  }
)[];