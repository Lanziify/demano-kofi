import { z } from 'zod';

export const mediaSchema = z.object({
  id: z.uuid(),
  storageKey: z.string(),
  mimeType: z.string(),
  fileSize: z.number().int().nonnegative(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const mediaVariantSchema = z.object({
  id: z.uuid(),
  mediaId: z.uuid(),
  type: z.enum(['thumbnail', 'medium', 'large']),
  storageKey: z.string(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  fileSize: z.number().int().nonnegative().nullable(),
  createdAt: z.date(),
});

export const mediaResponseSchema = mediaSchema.extend({
  url: z.url(),
  variants: z.object({
    thumbnail: z.url().optional(),
    medium: z.url().optional(),
    large: z.url().optional(),
  }),
});