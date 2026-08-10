import type { Selectable } from 'kysely';
import z from 'zod';
import type { ProductCategories } from '@/types/db';
import {
  createProductModifierGroupSchema,
  updateProductModifierGroupSchema,
} from './product-modifier-group.schema';

type Category = Selectable<ProductCategories>;

export const productCategorySchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1, 'Please enter category name').max(255),
  description: z.string(),
}) satisfies z.ZodType<Partial<Omit<Category, ColumnTimestampProperties>>>;

export type ProductCategorySchemaValue = z.infer<typeof productCategorySchema>;

export const createProductCategorySchema = productCategorySchema
  .extend({
    modifierGroups: z.array(createProductModifierGroupSchema).optional(),
  })
  .omit({ id: true });

export type CreateProductCategorySchemaValue = z.infer<
  typeof createProductCategorySchema
>;

export const updateProductCategorySchema = productCategorySchema.extend({
  modifierGroups: z.array(updateProductModifierGroupSchema).optional(),
});

export type UpdateProductCategorySchemaValue = z.infer<
  typeof updateProductCategorySchema
>;

/**
 * Category Query Schema
 */
export const productCategoryQuerySchema = z.object({
  id: z.string().optional(),
  include: z.enum(['groups', 'groupsModifiers']).optional(),
});

export type ProductCategoryQuerySchemaValues = z.infer<
  typeof productCategoryQuerySchema
>;
