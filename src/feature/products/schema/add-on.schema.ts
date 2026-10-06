import type { Selectable } from 'kysely';
import z from 'zod';
import type { ProductAddOns } from '@/types/db';

/**
 * Product add-on schema - links a product to another product offered as an add-on
 */
export const productAddOnSchema = z.object({
  productId: z.uuid(),
  addOnProductId: z.uuid('Please select a product.'),
  priceAmount: z.number('Please enter a valid number.').int().nonnegative('Please enter a valid number.'),
  sortOrder: z.number().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies z.ZodType<Selectable<ProductAddOns>>;

export type ProductAddOnValues = z.infer<typeof productAddOnSchema>;

/**
 * Product add-on form schema
 */
export const productAddOnFormSchema = productAddOnSchema.omit({ productId: true, createdAt: true, updatedAt: true });

export type ProductAddOnFormValues = z.infer<typeof productAddOnFormSchema>;
