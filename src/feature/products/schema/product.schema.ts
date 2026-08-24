import type { Selectable } from 'kysely';
import z from 'zod';
import type { ProductModifierGroups, ProductModifierOptions, Products } from '@/types/db';
import { modifierGroupFormWithOptionsSchema, modifierGroupOptionSchema } from './modifier.schema';
import { productImageFormSchema } from './product-image.schema';
import { variantFormSchema } from './variants.schema';

/**
 * Product schema
 */
export const productSchema = z.object({
  id: z.uuid(),
  categoryId: z.uuid('Please select category.'),
  name: z.string().trim().min(1, 'Please enter a product name.').max(255),
  description: z.string().trim(),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies z.ZodType<Selectable<Products>>;

export type ProductValues = z.infer<typeof productSchema>;

/**
 * Product modifier group option schema
 */
export const productModifierOptionSchema = z.object({
  productId: z.uuid(),
  modifierGroupId: z.uuid(),
  modifierOptionId: z.uuid(),
  priceAdjustment: z.number('Please enter a valid number').int().nonnegative(),
  sortOrder: z.number().nonnegative(),
}) satisfies z.ZodType<Selectable<ProductModifierOptions>>;

export type ProductModifierOptionValues = z.infer<typeof productModifierOptionSchema>;

/**
 * Product modifier group relation schema
 */
export const productModifierGroupSchema = z.object({
  productId: z.uuid(),
  categoryModifierGroupId: z.uuid(),
  modifierGroupId: z.uuid(),
  isRequired: z.boolean(),
  sortOrder: z.number().nonnegative(),
}) satisfies z.ZodType<Selectable<ProductModifierGroups>>;

export type ProductModifierGroupValues = z.infer<typeof productModifierGroupSchema>;

/**
 * Product form schema
 */
export const productModifierOptionFormSchema = modifierGroupOptionSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    id: z.uuid().optional(),
    modifierGroupId: z.uuid().optional(),
  });

export const productModifierGroupFormWithOptionsSchema = modifierGroupFormWithOptionsSchema
  .omit({ id: true, options: true })
  .extend({
    id: z.uuid().optional(),
    presetId: z.uuid().optional(),
    isRequired: z.boolean(),
    sortOrder: z.number().nonnegative(),
    options: z.array(productModifierOptionFormSchema).optional(),
  });

export const productFormSchema = productSchema.omit({ id: true, createdAt: true, updatedAt: true }).extend({
  id: z.uuid().optional(),
  images: z.array(productImageFormSchema).max(10).optional(),
  variants: z.array(variantFormSchema).optional(),
  modifierGroups: z.array(productModifierGroupFormWithOptionsSchema).optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
