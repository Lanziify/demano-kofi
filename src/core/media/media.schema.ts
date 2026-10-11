import type { Selectable } from 'kysely';
import { z } from 'zod';
import type { Media as MediaType, MediaVariants as MediaVariantsType } from '@/core/db/types';

/** `pending` until every variant has been generated, `failed` once the worker gives up. */
export const mediaStatusSchema = z.enum(['pending', 'ready', 'failed']);

export type MediaStatus = z.infer<typeof mediaStatusSchema>;

export const mediaVariantNameSchema = z.enum(['thumbnail', 'large']);

export type MediaVariantName = z.infer<typeof mediaVariantNameSchema>;

export const mediaSchema = z.object({
  id: z.uuid(),
  storageKey: z.string(),
  mimeType: z.string(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  fileSize: z.number().int().nonnegative().nullable(),
  status: mediaStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies z.ZodType<Selectable<MediaType>>;

export type MediaSchemaValue = z.infer<typeof mediaSchema>;

export const createMediaSchema = mediaSchema.omit({
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateMediaSchemaValue = z.infer<typeof createMediaSchema>;

export const mediaVariantSchema = z.object({
  mediaId: z.uuid(),
  name: mediaVariantNameSchema,
  storageKey: z.string(),
  mimeType: z.string(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  fileSize: z.number().int().nonnegative().nullable(),
  createdAt: z.date(),
}) satisfies z.ZodType<Selectable<MediaVariantsType>>;

export type MediaVariantSchemaValue = z.infer<typeof mediaVariantSchema>;

export type CreateMediaVariantValues = Omit<MediaVariantSchemaValue, 'createdAt'>;

export const uploadBucketSchema = z.object({
  key: z.string(),
  body: z.union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()]),
  contentType: z.string(),
});

export type UploadBucketValues = z.infer<typeof uploadBucketSchema>;
