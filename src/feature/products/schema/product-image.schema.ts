import type { Selectable } from 'kysely';
import z from 'zod';
import type { ProductImages } from '@/types/db';

type ColumnTimestampProperties = 'createdAt' | 'updatedAt';

type Image = Selectable<ProductImages>;

export const productImageSchema = z.object({
  mediaId: z.uuid(),
  productId: z.uuid(),
  sortOrder: z.number().nonnegative(),
}) satisfies z.ZodType<Partial<Omit<Image, 'id' | ColumnTimestampProperties>>>;

export type ProductImageSchemaValue = z.infer<typeof productImageSchema>;

export const productFileSchema = z
  .file()
  // .optional()
  .refine((file) => !file || file.size <= 5_000_000, {
    message: 'Image must be less than 5 MB',
  })
  .refine(
    (file) =>
      !file || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    {
      message: 'Only JPG, PNG, and WebP images are allowed',
    }
  );

export const addProductImageSchema = z.object({
  file: productFileSchema,
  altText: z.string().trim().max(255).optional(),
  sortOrder: z.number().int().nonnegative(),
  // isPrimary: z.boolean().optional(),
});

export type AddProductImageSchemaValue = z.infer<typeof addProductImageSchema>;
