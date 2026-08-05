import type { ProductModifierRepository } from '../repository/product-modifier.repository';
import type { CreateModifierSchemaValue } from '../schema/product-modifier.schema';

export class ProductModifierService {
  constructor(private readonly repository: ProductModifierRepository) {}

  async addModifier(
    modifierGroupId: string,
    values: CreateModifierSchemaValue
  ) {
    return await this.repository.create({ ...values, modifierGroupId });
  }

  // async updateModifier(
  //   modifierGroupId: string,
  //   id: string,
  //   values: CreateModifierSchemaValue
  // ) {
  //   const modifier = await this.repository.update(modifierGroupId, id, values);

  //   if (!modifier) {
  //     throw new NotFoundError('Product modifier not found', {
  //       errorCode: 'PRODUCT_MODIFIER_NOT_FOUND',
  //     });
  //   }

  //   return modifier;
  // }

  // async removeModifier(modifierGroupId: string, id: string) {
  //   const modifier = await this.repository.delete(modifierGroupId, id);

  //   if (!modifier) {
  //     throw new NotFoundError('Product modifier not found', {
  //       errorCode: 'PRODUCT_MODIFIER_NOT_FOUND',
  //     });
  //   }

  //   return modifier;
  // }

  // async getModifier(modifierGroupId: string, id: string) {
  //   const modifier = await this.repository.findById(modifierGroupId, id);

  //   if (!modifier) {
  //     throw new NotFoundError('Product modifier not found', {
  //       errorCode: 'PRODUCT_MODIFIER_NOT_FOUND',
  //     });
  //   }

  //   return modifier;
  // }

  // async getModifiers(modifierGroupId: string) {
  //   return await this.repository.findByModifierGroup(modifierGroupId);
  // }
}
