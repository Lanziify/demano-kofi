import type { Selectable } from 'kysely';
import z from 'zod';
import type { Products } from '@/types/db';
import { createProductCategorySchema } from './product-category.schema';
import { addProductImageSchema } from './product-image.schema';
import { createProductVariantSchema } from './product-variant.schema';

type ColumnTimestampProperties = 'createdAt' | 'updatedAt';

type Product = Selectable<Products>;

export const productSchema = z.object({
  categoryId: z.uuid().nullable().optional(),
  name: z.string().trim().min(1, 'Please enter a product name.').max(255),
  description: z.string().trim().nullable().optional(),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
}) satisfies z.ZodType<
  Partial<Omit<Product, 'id' | ColumnTimestampProperties>>
>;

export type ProductSchemaValue = z.infer<typeof productSchema>;

export const createProductSchema = productSchema
  .extend({
    // Images
    category: createProductCategorySchema.optional(),
    images: z.array(addProductImageSchema).max(10).optional(),
    // Variants
    variants: z
      .array(createProductVariantSchema)
      .min(1, 'Please add at least one variant.'),
  })
  .refine((data) => !(data.categoryId && data.category), {
    message: 'Provide either categoryId or category, not both.',
    path: ['category'],
  });

export type CreateProductSchemaValue = z.infer<typeof createProductSchema>;
