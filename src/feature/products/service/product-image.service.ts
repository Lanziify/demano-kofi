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

  async createImageObjects(productId: string, images: ProductImageFormValues[]) {
    const imageVariants = await Promise.all(
      images.map(async (image) => {
        const variants = await this.createImageVariants(image.file);

        return {
          altText: image.altText,
          sortOrder: image.sortOrder,
          variants,
        };
      })
    );

    const uploadObjects = imageVariants.flatMap((obj) =>
      Object.entries(obj.variants).map(([key, value]) => {
        const imageId = crypto.randomUUID();
        const storageKey = `products/${productId}/${imageId}/${key}.webp`;

        return {
          altText: obj.altText,
          sortOrder: obj.sortOrder,
          media: {
            id: imageId,
            type: mediaTypeSchema.parse(key),
            storageKey,
            fileSize: value.data.length,
            width: value.metadata.width,
            height: value.metadata.height,
          },
          upload: {
            key: storageKey,
            body: value.data,
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

  async createImageVariants(image: File) {
    if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
      throw new BadRequestError('Image file type is not supported.');
    }

    const buffer = Buffer.from(await image.arrayBuffer());

    const [original, large, thumbnail] = await Promise.all([
      this.process(buffer, 'productOriginal'),
      this.process(buffer, 'product'),
      this.process(buffer, 'productThumbnail'),
    ]);

    const [originalMetadata, largeMetadata, thumbnailMetadata] = await Promise.all([
      this.getMetadata(original),
      this.getMetadata(large),
      this.getMetadata(thumbnail),
    ]);

    return {
      original: { data: original, metadata: originalMetadata },
      large: { data: large, metadata: largeMetadata },
      thumbnail: { data: thumbnail, metadata: thumbnailMetadata },
    };
  }

  getPublicUrl(storageKey: string) {
    return this.storageService.getPublicUrl(storageKey);
  }
}
