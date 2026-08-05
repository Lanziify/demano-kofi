import { ProductCategoryModifierGroupRepository } from '../repository/product-category-modifier-group.repository';

export class ProductModifierGroupService {
  constructor(
    private readonly productModifierGroupRepository = new ProductCategoryModifierGroupRepository()
  ) {}

  // async linkModifierGroup(values: ProductCategoryModifierGroupLink) {
  //   return await this.productModifierGroupRepository.create(values);
  // }

  // async unlinkModifierGroup(productCategoryId: string, modifierGroupId: string) {
  //   const link = await this.productModifierGroupRepository.delete(
  //     productCategoryId,
  //     modifierGroupId
  //   );

  //   if (!link) {
  //     throw new NotFoundError('Product modifier group link not found', {
  //       errorCode: 'PRODUCT_MODIFIER_GROUP_NOT_FOUND',
  //     });
  //   }

  //   return link;
  // }

  // async getModifierGroups(productCategoryId: string) {
  //   return await this.productModifierGroupRepository.findByCategory(
  //     productCategoryId
  //   );
  // }
}
