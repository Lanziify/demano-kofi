import sharp, { type ResizeOptions } from 'sharp';
import { type ImagePreset, imagePresets } from '@/lib/image/presets';

export class ImageProcessingService {
  async process(buffer: Buffer, preset: ImagePreset) {
    const options = imagePresets[preset] as ResizeOptions & { quality: number };
    let image = sharp(buffer).rotate();

    if (options.width || options.height) {
      image = image.resize(options.width, options.height, {
        fit: options.fit,
        withoutEnlargement: true,
      });
    }

    return image
      .webp({
        quality: options.quality,
      })
      .toBuffer();
  }

  async getMetadata(buffer: Buffer<ArrayBuffer>) {
    return await sharp(buffer).metadata();
  }
}
