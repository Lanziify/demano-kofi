import type { Selectable } from 'kysely';
import z from 'zod';
import type { ProductCategories } from '@/core/db/types';

/**
 * Category schema
 */
export const productCategorySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1, 'Please enter a category name').max(255, 'Category name too long'),
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies z.ZodType<Selectable<ProductCategories>>;

export type ProductCategoryValues = z.infer<typeof productCategorySchema>;

/**
 * Category form schema
 */
export const productCategoryFormSchema = productCategorySchema.omit({ id: true, createdAt: true, updatedAt: true }).extend({
  id: z.uuid().optional(),
});

export type ProductCategoryFormValues = z.infer<typeof productCategoryFormSchema>;
