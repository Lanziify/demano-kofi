import type { Selectable } from 'kysely';
import z from 'zod';
import type { Products } from '@/types/db';
import { addProductImageSchema } from './product-image.schema';
import { updateProductModifierGroupSchema } from './product-modifier-group.schema';
import { createProductVariantSchema } from './product-variant.schema';

type Product = Selectable<Products>;

export const productSchema = z.object({
  id: z.uuid(),
  categoryId: z.uuid('Please select category.'),
  name: z.string().trim().min(1, 'Please enter a product name.').max(255),
  description: z.string().trim(),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
}) satisfies z.ZodType<Omit<Product, ColumnTimestampProperties>>;

export type ProductSchemaValue = z.infer<typeof productSchema>;

export const createProductSchema = productSchema.omit({ id: true }).extend({
  // Images
  images: z.array(addProductImageSchema).max(10).optional(),
  // Variants
  variants: z
    .array(createProductVariantSchema)
    // .min(1, 'Please add at least one variant.')
    .optional(),
  modifierGroups: z.array(updateProductModifierGroupSchema).optional(),
});

export type CreateProductSchemaValue = z.infer<typeof createProductSchema>;
