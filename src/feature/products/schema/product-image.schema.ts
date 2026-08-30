import type { Selectable } from 'kysely';
import z from 'zod';
import type { ProductImages } from '@/types/db';

export const productImageSchema = z.object({
  mediaId: z.uuid(),
  productId: z.uuid(),
  sortOrder: z.number().nonnegative(),
  altText: z.string().trim().max(255),
}) satisfies z.ZodType<Selectable<ProductImages>>;

export type ProductImageValues = z.infer<typeof productImageSchema>;

export const productFileSchema = z
  .file()
  .refine((file) => !file || file.size <= 5_000_000, {
    message: 'Image must be less than 5 MB',
  })
  .refine((file) => !file || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type), {
    message: 'Only JPG, PNG, and WebP images are allowed',
  });

export const productImageFormSchema = productImageSchema.omit({ mediaId: true, productId: true }).extend({
  mediaId: z.uuid().optional(),
  productId: z.uuid().optional(),
  file: productFileSchema.optional(),
  imageUrl: z.string().optional(),
  sortOrder: z.number().int().nonnegative(),
});

export type ProductImageFormValues = z.infer<typeof productImageFormSchema>;

export const productImageProcessRequestedPayloadSchema = z.object({
  productId: z.uuid(),
  mediaId: z.uuid(),
  storageKey: z.string(),
  altText: z.string().trim().max(255),
  sortOrder: z.number().int().nonnegative(),
});

export type ProductImageProcessRequestedPayload = z.infer<typeof productImageProcessRequestedPayloadSchema>;
