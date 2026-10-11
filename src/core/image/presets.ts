import type { ResizeOptions } from 'sharp';

export const imagePresets = {
  avatar: {
    width: 512,
    height: 512,
    fit: 'cover',
    quality: 85,
  },

  productOriginal: {
    quality: 90,
  },

  product: {
    width: 1600,
    height: 1600,
    fit: 'inside',
    quality: 85,
  },

  productThumbnail: {
    width: 300,
    height: 300,
    fit: 'cover',
    quality: 80,
  },
} satisfies Record<string, ResizeOptions & { quality: number }>;

export type ImagePreset = keyof typeof imagePresets;
