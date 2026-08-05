import { DatabaseError } from '@/lib/errors/app-error';
import { db } from '@/utils/db';
import { ProductModifierRepository } from '../repository/product-modifier.repository';
import type { ProductModifierGroupRepository } from '../repository/product-modifier-group.repository';
import type { CreateProductModifierGroupSchemaValue } from '../schema/product-modifier-group.schema';

export class ModifierGroupService {
  constructor(
    private repository: ProductModifierGroupRepository,
    private modifierRepository = new ProductModifierRepository()
  ) {}

  async createModifierGroup(values: CreateProductModifierGroupSchemaValue) {
    const { modifiers, ...groupData } = values;

    return await db.transaction().execute(async (trx) => {
      const groupRepo = this.repository.withTransaction(trx);
      const modifierRepo = this.modifierRepository.withTransaction(trx);

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

      return group;
    });
  }

  // async updateModifierGroup(id: string, values: ProductModifierGroupSchemaValue) {
  //   const modifierGroup = await this.repository.update(id, values);

  //   if (!modifierGroup) {
  //     throw new NotFoundError('Modifier group not found', {
  //       errorCode: 'MODIFIER_GROUP_NOT_FOUND',
  //     });
  //   }

  //   return modifierGroup;
  // }

  // async deleteModifierGroup(id: string) {
  //   const modifierGroup = await this.repository.delete(id);

  //   if (!modifierGroup) {
  //     throw new NotFoundError('Modifier group not found', {
  //       errorCode: 'MODIFIER_GROUP_NOT_FOUND',
  //     });
  //   }

  //   return modifierGroup;
  // }

  // async getModifierGroup(id: string) {
  //   const modifierGroup = await this.repository.findById(id);

  //   if (!modifierGroup) {
  //     throw new NotFoundError('Modifier group not found', {
  //       errorCode: 'MODIFIER_GROUP_NOT_FOUND',
  //     });
  //   }

  //   return modifierGroup;
  // }

  // async getAllModifierGroups() {
  //   return await this.repository.findAll();
  // }

  // async getModifierGroups(options: FindManyModifierGroupsOptions) {
  //   return await this.repository.findMany(options);
  // }
}
