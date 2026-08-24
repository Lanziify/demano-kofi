import type { Selectable } from 'kysely';
import z from 'zod';
import type { Variants } from '@/types/db';

/**
 * Variant schema
 */
export const variantsSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1, 'Please enter a variant name.').max(255),
  productId: z.uuid(),
  sku: z.string().min(1, 'Please enter SKU').max(50, 'SKU too long'),
  priceAmount: z.number().nonnegative(),
  sortOrder: z.number().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies z.ZodType<Selectable<Variants>>;

export type VariantValues = z.infer<typeof variantsSchema>;

/**
 * Variant form schema
 */
export const variantFormSchema = variantsSchema
  .omit({ id: true, productId: true, priceAmount: true, createdAt: true, updatedAt: true })
  .extend({
    id: z.uuid().optional(),
    productId: z.uuid().optional(),
    priceAmount: z.union([
      z.literal('').refine(() => false, {
        message: 'Please enter a price.',
      }),
      z.number('Please enter a valid number.').int().nonnegative('Please enter a valid number.'),
    ]),
  });

export type VariantFormValues = z.infer<typeof variantFormSchema>;

export type VariantFormFieldValues = z.input<typeof variantFormSchema>;
