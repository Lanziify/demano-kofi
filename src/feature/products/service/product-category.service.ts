import type { Selectable, Transaction } from 'kysely';
import { DatabaseError, NotFoundError } from '@/lib/errors/app-error';
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
import type {
  CreateProductCategorySchemaValue,
  UpdateProductCategorySchemaValue,
} from '../schema/product-category.schema';

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
      const { modifierGroups, ...categoryData } = values;

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

      const links: { productCategoryId: string; modifierGroupId: string }[] = []

      for (const { modifiers, ...groupData } of modifierGroups ?? []) {
        const group = await groupRepo.create(groupData);

        if (!group) {
          throw new DatabaseError(
            'An error has occurred while trying to store modifier group'
          );
        }

        if (modifiers && modifiers.length > 0) {
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

  async updateCategory(
    values: UpdateProductCategorySchemaValue,
    trx?: Transaction<DB>
  ) {
    const run = async (trx: Transaction<DB>) => {
      const { modifierGroups, ...categoryData } = values;

      const categoryRepo = this.productCategoryRepository.withTransaction(trx);
      const groupRepo =
        this.productModifierGroupRepository.withTransaction(trx);
      const modifierRepo = this.productModifierRepository.withTransaction(trx);
      const linkRepo =
        this.productCategoryModifierGroupRepository.withTransaction(trx);

      const existing = await categoryRepo.findOneWithGroupsModifiers(values.id);

      if (!existing) {
        throw new NotFoundError('Category not found', {
          errorCode: 'CATEGORY_NOT_FOUND',
        });
      }

      const updated = await categoryRepo.update(categoryData);

      if (!updated) {
        throw new DatabaseError(
          'An error has occurred while trying to update category'
        );
      }

      const keptGroupIds = new Set(
        (modifierGroups ?? [])
          .map((group) => group.id)
          .filter((id): id is string => Boolean(id))
      );

      // Groups no longer present in the payload are unlinked from this
      // category, not deleted — they may still be linked to other categories.
      for (const group of existing.modifierGroups) {
        if (!keptGroupIds.has(group.id)) {
          await linkRepo.delete(existing.id, group.id);
        }
      }

      for (const { id: groupId, modifiers, ...groupData } of modifierGroups ??
        []) {
        const group = groupId
          ? await groupRepo.update({ id: groupId, ...groupData })
          : await groupRepo.create(groupData);

        if (!group) {
          throw new DatabaseError(
            'An error has occurred while trying to store modifier group'
          );
        }

        // A group without an id wasn't linked to this category yet.
        if (!groupId) {
          await linkRepo.create({
            productCategoryId: existing.id,
            modifierGroupId: group.id,
          });
        }

        const existingModifiers = groupId
          ? existing.modifierGroups.find((g) => g.id === groupId)?.modifiers
          : undefined;

        const keptModifierIds = new Set(
          (modifiers ?? [])
            .map((modifier) => modifier.id)
            .filter((id): id is string => Boolean(id))
        );

        for (const modifier of existingModifiers ?? []) {
          if (!keptModifierIds.has(modifier.id)) {
            await modifierRepo.delete(group.id, modifier.id);
          }
        }

        for (const { id: modifierId, ...modifierData } of modifiers ?? []) {
          if (modifierId) {
            await modifierRepo.update({ id: modifierId, ...modifierData });
          } else {
            await modifierRepo.create({
              ...modifierData,
              modifierGroupId: group.id,
            });
          }
        }
      }

      return updated;
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

export type ProductCategory = Selectable<ProductCategories>;

export type ProductCategoryWithGroups = (ProductCategory & {
  modifierGroups: Selectable<ProductModifierGroups>[];
})[];

export type ProductCategoryWithGroupsModifiers = (ProductCategory & {
  modifierGroups: (Selectable<ProductModifierGroups> & {
    modifiers: ProductModifiers[];
  })[];
})[];
