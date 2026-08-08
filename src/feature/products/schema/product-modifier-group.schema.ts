import type { Selectable } from 'kysely';
import z from 'zod';
import type { ProductModifierGroups } from '@/types/db';
import { createProductModifierSchema } from './product-modifier.schema';

type ColumnTimestampProperties = 'createdAt' | 'updatedAt';

type ModifierGroup = Selectable<ProductModifierGroups>;

export const modifierSelectionTypeSchema = z.enum(['single', 'multiple']);

export const productModifierGroupSchema = z.object({
  name: z.string().trim().min(1, "Please enter modifier group name").max(255),
  selectionType: modifierSelectionTypeSchema,
  isRequired: z.boolean().default(false),
}) satisfies z.ZodType<Omit<ModifierGroup, 'id' | ColumnTimestampProperties>>;

export type ProductModifierGroupSchemaValue = z.infer<
  typeof productModifierGroupSchema
>;

export const createProductModifierGroupSchema =
  productModifierGroupSchema.extend({
    modifiers: z.array(createProductModifierSchema),
  });

export type CreateProductModifierGroupSchemaValue = z.infer<
  typeof createProductModifierGroupSchema
>;

export type ModifierGroupFieldValue = z.input<typeof createProductModifierGroupSchema>;