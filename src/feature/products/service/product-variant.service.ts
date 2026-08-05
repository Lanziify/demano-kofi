import { ProductVariantRepository } from '../repository/product-variant.repository';
import type { ProductVariantSchemaValue } from '../schema/product-variant.schema';
// import type { ProductVariantSchemaValues } from '../schema/schema';

export class ProductVariantService {
  constructor(
    private readonly productVariantRepository = new ProductVariantRepository()
  ) {}

  async addVariant(values: ProductVariantSchemaValue) {
    return await this.productVariantRepository.create(values);
  }

  // async updateVariant(
  //   productId: string,
  //   id: string,
  //   values: ProductVariantSchemaValues
  // ) {
  //   const variant = await this.repository.update(productId, id, values);

  //   if (!variant) {
  //     throw new NotFoundError('Product variant not found', {
  //       errorCode: 'PRODUCT_VARIANT_NOT_FOUND',
  //     });
  //   }

  //   return variant;
  // }

  // async removeVariant(productId: string, id: string) {
  //   const variant = await this.repository.delete(productId, id);

  //   if (!variant) {
  //     throw new NotFoundError('Product variant not found', {
  //       errorCode: 'PRODUCT_VARIANT_NOT_FOUND',
  //     });
  //   }

  //   return variant;
  // }

  // async getVariant(productId: string, id: string) {
  //   const variant = await this.repository.findById(productId, id);

  //   if (!variant) {
  //     throw new NotFoundError('Product variant not found', {
  //       errorCode: 'PRODUCT_VARIANT_NOT_FOUND',
  //     });
  //   }

  //   return variant;
  // }

  // async getVariants(productId: string) {
  //   return await this.repository.findByProduct(productId);
  // }
}
