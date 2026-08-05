import type { Selectable } from 'kysely';
import z from 'zod';
import type { ProductCategories } from '@/types/db';
import { createProductModifierGroupSchema } from './product-modifier-group.schema';

type ColumnTimestampProperties = 'createdAt' | 'updatedAt';

type Category = Selectable<ProductCategories>;

export const productCategorySchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().nullable().optional(),
}) satisfies z.ZodType<
  Partial<Omit<Category, 'id' | ColumnTimestampProperties>>
>;

export type ProductCategorySchemaValue = z.infer<typeof productCategorySchema>;

export const createProductCategorySchema = productCategorySchema.extend({
  // Link existing modifier groups to this category.
  modifierGroupIds: z
    .array(z.uuid())
    .optional()
    .refine((ids) => !ids || new Set(ids).size === ids.length, {
      message: 'Modifier groups must be unique.',
    }),
  // Create new modifier groups (with their modifiers) for this category.
  modifierGroups: z.array(createProductModifierGroupSchema).optional(),
});

export type CreateProductCategorySchemaValue = z.infer<
  typeof createProductCategorySchema
>;
