import { posix } from 'node:path';
import { ImageProcessingService } from '@/core/image/image.service';
import type { ImagePreset } from '@/core/image/presets';
import { MediaRepository } from '@/core/media/media.repository';
import type { MediaVariantName } from '@/core/media/media.schema';
import { StorageService } from '@/core/storage/storage.service';

export type MediaVariantDefinition = {
  name: MediaVariantName;
  preset: ImagePreset;
};

export class MediaService {
  constructor(
    private readonly mediaRepository = new MediaRepository(),
    private readonly storageService = new StorageService(),
    private readonly imageService = new ImageProcessingService()
  ) {}

  /**
   * Generates the given variants from a media's original and marks it `ready`.
   * Variants are stored next to the original (`<folder>/<name>.webp`), so storage keys are
   * deterministic and a retried job overwrites instead of duplicating. Returns false when the
   * media no longer exists (e.g. its owner was deleted before the job ran).
   */
  async generateVariants(mediaId: string, variants: readonly MediaVariantDefinition[]) {
    const media = await this.mediaRepository.findById(mediaId);

    if (!media) {
      return false;
    }

    const original = await this.storageService.downloadObject(media.storageKey);
    const folder = posix.dirname(media.storageKey);

    for (const variant of variants) {
      const data = await this.imageService.process(original, variant.preset);
      const metadata = await this.imageService.getMetadata(data);
      const storageKey = `${folder}/${variant.name}.webp`;

      await this.storageService.uploadObject({ key: storageKey, body: data, contentType: 'image/webp' });

      await this.mediaRepository.createVariantIfNotExists({
        mediaId,
        name: variant.name,
        storageKey,
        mimeType: 'image/webp',
        fileSize: data.length,
        width: metadata.width ?? null,
        height: metadata.height ?? null,
      });
    }

    await this.mediaRepository.updateStatus(mediaId, 'ready');

    return true;
  }

  async markFailed(mediaId: string) {
    await this.mediaRepository.updateStatus(mediaId, 'failed');
  }

  getPublicUrl(storageKey: string) {
    return this.storageService.getPublicUrl(storageKey);
  }
}
