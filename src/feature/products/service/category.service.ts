import type { Transaction } from 'kysely';
import { DatabaseError, NotFoundError, ValidationError } from '@/lib/errors/app-error';
import type { DB } from '@/types/db';
import { db } from '@/utils/db';
import { CategoryRepository } from '../repository/category.repository';
import { CategoryModifierGroupRepository } from '../repository/category-modifier-group.repository';
import { ModifierGroupRepository } from '../repository/modifier-group.repository';
import { ModifierGroupOptionRepository } from '../repository/modifier-option.repository';
import type {
  CategoryFormWithModifierGroupsValue,
  CategoryModifierGroupWithoutIdValues,
} from '../schema/category.schema';
import { modifierGroupFormSchema } from '../schema/modifier.schema';

export class CategoryService {
  constructor(
    private readonly categoryRepository = new CategoryRepository(),
    private readonly categoryModifierGroupRepository = new CategoryModifierGroupRepository(),
    private readonly modifierGroupRepository = new ModifierGroupRepository(),
    private readonly modifierGroupOptionRepository = new ModifierGroupOptionRepository()
  ) {}

  async createCategory(values: CategoryFormWithModifierGroupsValue, trx?: Transaction<DB>) {
    const run = async (trx: Transaction<DB>) => {
      const { id: _, modifierGroups, ...categoryData } = values;

      const categoryRepo = this.categoryRepository.withTransaction(trx);
      const categoryModifierGroupRepo = this.categoryModifierGroupRepository.withTransaction(trx);
      const modifierGroupRepo = this.modifierGroupRepository.withTransaction(trx);
      const modifierGroupOptionRepo = this.modifierGroupOptionRepository.withTransaction(trx);

      const category = await categoryRepo.create(categoryData);

      if (!category) {
        throw new DatabaseError('An error has occurred while trying to store category');
      }

      const relations: CategoryModifierGroupWithoutIdValues[] = [];

      for (const { options, sortOrder, ...modifierGroupData } of modifierGroups ?? []) {
        const { data: parsedValues } = modifierGroupFormSchema.safeParse(modifierGroupData);

        if (!parsedValues) {
          throw new DatabaseError('Error while trying to parse modifier group');
        }

        const group = await modifierGroupRepo.create(parsedValues);

        if (!group) {
          throw new DatabaseError('An error has occurred while trying to store modifier group');
        }

        if (options && options.length > 0) {
          await modifierGroupOptionRepo.createMany(
            options.map((option) => ({
              ...option,
              modifierGroupId: group.id,
            }))
          );
        }

        relations.push({
          categoryId: category.id,
          modifierGroupId: group.id,
          sortOrder,
        });
      }

      if (relations.length > 0) {
        await categoryModifierGroupRepo.createMany(relations);
      }

      return category;
    };

    return trx ? run(trx) : db.transaction().execute(run);
  }

  async updateCategory(values: CategoryFormWithModifierGroupsValue, trx?: Transaction<DB>) {
    const run = async (trx: Transaction<DB>) => {
      const { modifierGroups, ...categoryData } = values;

      const categoryRepo = this.categoryRepository.withTransaction(trx);
      const categoryModifierGroupRepo = this.categoryModifierGroupRepository.withTransaction(trx);
      const modifierGroupRepo = this.modifierGroupRepository.withTransaction(trx);
      const modifierGroupOptionRepo = this.modifierGroupOptionRepository.withTransaction(trx);

      if (!categoryData.id) {
        throw new ValidationError('Missing category ID', {
          errorCode: 'VALIDATION_ERROR',
        });
      }

      const existing = await categoryRepo.findOneWithModifierGroupOptions(categoryData.id);

      if (!existing) {
        throw new NotFoundError('Category not found', {
          errorCode: 'CATEGORY_NOT_FOUND',
        });
      }

      const updated = await categoryRepo.update({
        ...categoryData,
        id: categoryData.id,
      });

      if (!updated) {
        throw new DatabaseError('An error has occurred while trying to update category');
      }

      const keptGroupIds = new Set(
        (modifierGroups ?? []).map((group) => group.id).filter((id): id is string => Boolean(id))
      );

      for (const group of existing.modifierGroups) {
        if (!keptGroupIds.has(group.id)) {
          await categoryModifierGroupRepo.delete(existing.id, group.id);
        }
      }

      for (const { id: groupId, options, sortOrder, ...groupData } of modifierGroups ?? []) {
        const group = groupId
          ? await modifierGroupRepo.update({ id: groupId, ...groupData })
          : await modifierGroupRepo.create(groupData);

        if (!group) {
          throw new DatabaseError('An error has occurred while trying to store modifier group');
        }

        if (!groupId) {
          await categoryModifierGroupRepo.create({
            categoryId: existing.id,
            modifierGroupId: group.id,
            sortOrder,
          });
        }

        const existingOptions = groupId ? existing.modifierGroups.find((g) => g.id === groupId)?.options : undefined;

        const keptModifierIds = new Set(
          (options ?? []).map((option) => option.id).filter((id): id is string => Boolean(id))
        );

        for (const option of existingOptions ?? []) {
          if (!keptModifierIds.has(option.id)) {
            await modifierGroupOptionRepo.delete(group.id, option.id);
          }
        }

        for (const { id: modifierOptionId, modifierGroupId, ...modifierOptionData } of options ?? []) {
          if (modifierOptionId && modifierGroupId) {
            await modifierGroupOptionRepo.update({
              ...modifierOptionData,
              id: modifierOptionId,
              modifierGroupId,
            });
          } else {
            await modifierGroupOptionRepo.create({
              ...modifierOptionData,
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
    return await this.categoryRepository.findAll();
  }

  async getCategoryById(id: string) {
    return await this.categoryRepository.findById(id);
  }

  async getCategoriesWithModifierGroupOptions() {
    return await this.categoryRepository.findWithModifierGroupOptions();
  }

  async getCategoryModifierGroups() {}
}
