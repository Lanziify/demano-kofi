import type { Selectable } from 'kysely';
import z from 'zod';
import type { Categories } from '@/core/db/types';

/**
 * Category schema
 */
export const categorySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1, 'Please enter a category name').max(255, 'Category name too long'),
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies z.ZodType<Selectable<Categories>>;

export type CategoryValues = z.infer<typeof categorySchema>;

/**
 * Category form schema
 */
export const categoryFormSchema = categorySchema.omit({ id: true, createdAt: true, updatedAt: true }).extend({
  id: z.uuid().optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
