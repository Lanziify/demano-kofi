import type { Job } from 'bullmq';
import { MediaService, type MediaVariantDefinition } from '@/core/media/media.service';
import { productImageProcessRequestedPayloadSchema } from '../schema/product-image.schema';

const mediaService = new MediaService();

/** Sizes generated for every product image, in addition to the original uploaded by `ProductImageService`. */
export const PRODUCT_IMAGE_VARIANTS = [
  { name: 'large', preset: 'product' },
  { name: 'thumbnail', preset: 'productThumbnail' },
] as const satisfies readonly MediaVariantDefinition[];

/**
 * Generates the variants deferred by `ProductImageService.createOriginalImageObjects`.
 * Safe to run more than once for the same job (see `MediaService.generateVariants`), and a
 * no-op if the image was removed from its product before the job ran.
 */
export async function processProductImageEvent(job: Job) {
  const { mediaId } = productImageProcessRequestedPayloadSchema.parse(job.data);

  try {
    await mediaService.generateVariants(mediaId, PRODUCT_IMAGE_VARIANTS);
  } catch (error) {
    const isFinalAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);

    if (isFinalAttempt) {
      await mediaService.markFailed(mediaId);
    }

    throw error;
  }
}
