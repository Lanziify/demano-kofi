import type { Job } from 'bullmq';
import { ProductImageRepository } from '@/feature/products/repository/product-image.repository';
import { productImageProcessRequestedPayloadSchema } from '@/feature/products/schema/product-image.schema';
import { MediaRepository } from '@/repository/media.repository';
import { mediaTypeSchema } from '@/schema/media.schema';
import { ImageProcessingService } from '@/service/image.service';
import { StorageService } from '@/service/storage.service';

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
