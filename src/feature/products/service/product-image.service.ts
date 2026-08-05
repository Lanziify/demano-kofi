import type { Transaction } from 'kysely';
import type { DB } from '@/types/db';
import { db } from '@/utils/db';
import { ProductImageRepository } from '../repository/product-image.repository';
import type { AddProductImageSchemaValue } from '../schema/product-image.schema';

export class ProductImageService {
  constructor(
    private readonly imageRepository = new ProductImageRepository()
  ) {}

  async addImage(value: AddProductImageSchemaValue[], trx?: Transaction<DB>) {
    const run = async (trx: Transaction<DB>) => {};

    return trx ? run(trx) : db.transaction().execute(run);
  }

  // async removeImage(productId: string, id: string) {
  //   const image = await this.repository.delete(productId, id);

  //   if (!image) {
  //     throw new NotFoundError('Product image not found', {
  //       errorCode: 'PRODUCT_IMAGE_NOT_FOUND',
  //     });
  //   }

  //   return image;
  // }

  // async getImage(productId: string, id: string) {
  //   const image = await this.repository.findById(productId, id);

  //   if (!image) {
  //     throw new NotFoundError('Product image not found', {
  //       errorCode: 'PRODUCT_IMAGE_NOT_FOUND',
  //     });
  //   }

  //   return image;
  // }

  // async getImages(productId: string) {
  //   return await this.repository.findByProduct(productId);
  // }
}
