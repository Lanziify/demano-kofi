import type { Selectable } from 'kysely';
import { z } from 'zod';
import type { Media as MediaType } from '@/types/db';

export const mediaTypeSchema = z.enum(['thumbnail', 'medium', 'large', 'original']);

export const mediaSchema = z.object({
  id: z.uuid(),
  type: mediaTypeSchema,
  storageKey: z.string(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  fileSize: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies z.ZodType<Selectable<MediaType>>;

export type MediaSchemaValue = z.infer<typeof mediaSchema>;

export const createMediaSchema = mediaSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type CreateMediaSchemaValue = z.infer<typeof createMediaSchema>;

export const uploadBucketSchema = z.object({
  key: z.string(),
  body: z.union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()]),
  contentType: z.string(),
});

export type UploadBucketValues = z.infer<typeof uploadBucketSchema>;
