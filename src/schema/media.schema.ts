import type { Selectable } from 'kysely';
import { z } from 'zod';
import type { Media as MediaType } from '@/types/db';

type ColumnTimestampProperties = 'createdAt' | 'updatedAt';

export type Media = Selectable<MediaType>;

export const mediaTypeSchema = z.enum([
  'thumbnail',
  'medium',
  'large',
  'original',
]);

export const mediaSchema = z.object({
  type: mediaTypeSchema,
  storageKey: z.string(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  fileSize: z.number().int().nonnegative(),
}) satisfies z.ZodType<Partial<Omit<Media, 'id' | ColumnTimestampProperties>>>;

export type MediaSchemaValue = z.infer<typeof mediaSchema>;

export const createMediaSchema = mediaSchema.extend({
  id: z.uuid(),
});

export type CreateMediaSchemaValue = z.infer<typeof createMediaSchema>;
