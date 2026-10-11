import type { Job } from 'bullmq';
import { ImageProcessingService } from '@/core/image/image.service';
import { MediaRepository } from '@/core/media/media.repository';
import { mediaTypeSchema } from '@/core/media/media.schema';
import { StorageService } from '@/core/storage/storage.service';
import { ProductImageRepository } from '../repository/product-image.repository';
import { productImageProcessRequestedPayloadSchema } from '../schema/product-image.schema';

const imageProcessingService = new ImageProcessingService();
const storageService = new StorageService();
const mediaRepository = new MediaRepository();
const productImageRepository = new ProductImageRepository();

const DEFERRED_VARIANTS = [
  { type: 'large', preset: 'product' },
  { type: 'thumbnail', preset: 'productThumbnail' },
] as const;

/**
 * Generates the `large`/`thumbnail` variants deferred by `ProductImageService.createOriginalImageObjects`.
 * Safe to run more than once for the same job: storage keys are deterministic (derived from
 * productId + the original mediaId) and both DB writes use "insert if not already there".
 */
export async function processProductImageEvent(job: Job) {
  const payload = productImageProcessRequestedPayloadSchema.parse(job.data);

  const original = await storageService.downloadObject(payload.storageKey);
  const folder = `products/${payload.productId}/${payload.mediaId}`;

  for (const variant of DEFERRED_VARIANTS) {
    const data = await imageProcessingService.process(original, variant.preset);
    const metadata = await imageProcessingService.getMetadata(data);
    const storageKey = `${folder}/${variant.type}.webp`;

    await storageService.uploadObject({ key: storageKey, body: data, contentType: 'image/webp' });

    const media = await mediaRepository.createIfNotExists({
      id: crypto.randomUUID(),
      type: mediaTypeSchema.parse(variant.type),
      storageKey,
      fileSize: data.length,
      width: metadata.width ?? null,
      height: metadata.height ?? null,
    });

    await productImageRepository.createIfNotExists({
      mediaId: media.id,
      productId: payload.productId,
      altText: payload.altText,
      sortOrder: payload.sortOrder,
    });
  }
}
