import type { Metadata } from 'sharp';
import { BadRequestError } from '@/lib/errors/app-error';
import { ALLOWED_IMAGE_TYPES } from '@/lib/image/constants';
import { MediaRepository } from '@/repository/media.repository';
import {
  type CreateMediaSchemaValue,
  mediaTypeSchema,
} from '@/schema/media.schema';
import { ImageProcessingService } from '@/service/image.service';
import { StorageService } from '@/service/storage.service';
import { db } from '@/utils/db';
import { ProductImageRepository } from '../repository/product-image.repository';
import type {
  AddProductImageSchemaValue,
  ProductImageSchemaValue,
} from '../schema/product-image.schema';

export class ProductImageService extends ImageProcessingService {
  constructor(
    private readonly imageRepository = new ProductImageRepository(),
    private readonly mediaRepository = new MediaRepository(),
    private readonly storageService = new StorageService()
  ) {
    super();
  }

  async addImages(productId: string, images: AddProductImageSchemaValue[]) {
    const uploadedKeys: string[] = [];
    const uploadObjects: CreateMediaSchemaValue[] = [];
    const productImageMediaLinks: ProductImageSchemaValue[] = [];

    try {
      const processedImage = await Promise.all(
        images.map(async (image) => {
          const variants = await this.processVariants(image.file);

          return {
            sortOrder: image.sortOrder,
            variants,
          };
        })
      );

      await Promise.all(
        processedImage.flatMap((image) =>
          Object.entries(image.variants).map(([key, value]) => {
            const imageId = crypto.randomUUID();
            const uploadKey = `products/${productId}/${imageId}/${key}.webp`;

            uploadedKeys.push(uploadKey);
            uploadObjects.push({
              id: imageId,
              type: mediaTypeSchema.parse(key),
              storageKey: uploadKey,
              fileSize: value.data.length,
              width: value.info.width,
              height: value.info.height,
            });
            productImageMediaLinks.push({
              productId,
              mediaId: imageId,
              sortOrder: image.sortOrder,
            });

            return this.storageService.uploadObject({
              key: uploadKey,
              body: value.data,
              contentType: 'image/webp',
            });
          })
        )
      );
    } catch (error) {
      await Promise.all(
        uploadedKeys.map((key) => this.storageService.deleteObject(key))
      );

      throw error;
    }

    return await db.transaction().execute(async (trx) => {
      const mediaRepo = this.mediaRepository.withTransaction(trx);
      const productImageRepo = this.imageRepository.withTransaction(trx);

      await mediaRepo.createMany(uploadObjects);
      return await productImageRepo.createMany(productImageMediaLinks);
    });
  }

  async processVariants(image: File) {
    if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
      throw new BadRequestError('Image file type is not supported.');
    }

    const buffer = Buffer.from(await image.arrayBuffer());

    const [original, large, thumbnail] = await Promise.all([
      this.process(buffer, 'productOriginal'),
      this.process(buffer, 'product'),
      this.process(buffer, 'productThumbnail'),
    ]);

    const buffersByVariant = { original, large, thumbnail };
    const variants = {} as Record<
      string,
      { data: Buffer<ArrayBuffer>; info: Metadata }
    >;

    await Promise.all(
      Object.entries(buffersByVariant).map(async ([key, data]) => {
        variants[key] = { data, info: await this.getMetadata(data) };
      })
    );

    return variants;
  }
}
