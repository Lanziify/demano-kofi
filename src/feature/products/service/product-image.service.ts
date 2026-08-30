import { BadRequestError } from '@/lib/errors/app-error';
import { ALLOWED_IMAGE_TYPES } from '@/lib/image/constants';
import { mediaTypeSchema } from '@/schema/media.schema';
import { ImageProcessingService } from '@/service/image.service';
import { StorageService } from '@/service/storage.service';
import type { ProductImageFormValues } from '../schema/product-image.schema';

export class ProductImageService extends ImageProcessingService {
  constructor(private readonly storageService = new StorageService()) {
    super();
  }

  /**
   * Uploads only the `original` variant synchronously so product creation stays fast.
   * The `large` and `thumbnail` variants are generated later by the image-processing
   * worker, dispatched via an outbox event referencing this storage key.
   */
  async createOriginalImageObjects(productId: string, images: ProductImageFormValues[]) {
    const uploadObjects = await Promise.all(
      images
        .filter((image): image is ProductImageFormValues & { file: File } => typeof image.file !== 'undefined')
        .map(async (image) => {
          const original = await this.processOriginal(image.file);
          const imageId = crypto.randomUUID();
          const storageKey = `products/${productId}/${imageId}/original.webp`;

          return {
            altText: image.altText,
            sortOrder: image.sortOrder,
            media: {
              id: imageId,
              type: mediaTypeSchema.parse('original'),
              storageKey,
              fileSize: original.data.length,
              width: original.metadata.width,
              height: original.metadata.height,
            },
            upload: {
              key: storageKey,
              body: original.data,
              contentType: 'image/webp',
            },
          };
        })
    );

    try {
      await Promise.all(uploadObjects.map(({ upload }) => this.storageService.uploadObject(upload)));
    } catch (error) {
      await this.removeImageObjects(uploadObjects);

      throw error;
    }

    return uploadObjects;
  }

  async removeImageObjects(
    objects: {
      upload: {
        key: string;
      };
    }[]
  ) {
    const results = await Promise.allSettled(objects.map(({ upload }) => this.storageService.deleteObject(upload.key)));

    return results;
  }

  private async processOriginal(image: File) {
    if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
      throw new BadRequestError('Image file type is not supported.');
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const data = await this.process(buffer, 'productOriginal');
    const metadata = await this.getMetadata(data);

    return { data, metadata };
  }

  getPublicUrl(storageKey: string) {
    return this.storageService.getPublicUrl(storageKey);
  }
}
