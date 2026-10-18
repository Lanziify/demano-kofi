import z from 'zod';
import type { InventoryCategory } from '../types/types';

/**
 * Category schema
 */
export const inventoryCategorySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1, 'Please enter a category name').max(255, 'Category name too long'),
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies z.ZodType<InventoryCategory>;

export type InventoryCategoryValues = z.infer<typeof inventoryCategorySchema>;

/**
 * Category form schema
 */
export const inventoryCategoryFormSchema = inventoryCategorySchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    id: z.uuid().optional(),
  });

export type InventoryCategoryFormValues = z.infer<typeof inventoryCategoryFormSchema>;
