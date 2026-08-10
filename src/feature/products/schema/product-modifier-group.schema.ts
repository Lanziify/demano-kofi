import type { Selectable } from 'kysely';
import z from 'zod';
import type { ProductModifierGroups } from '@/types/db';
import {
  createProductModifierSchema,
  updateProductModifierSchema,
} from './product-modifier.schema';

type ModifierGroup = Selectable<ProductModifierGroups>;

export const modifierSelectionTypeSchema = z.enum(['single', 'multiple']);

export const productModifierGroupSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1, 'Please enter modifier group name').max(255),
  selectionType: modifierSelectionTypeSchema,
  isRequired: z.boolean().default(false),
}) satisfies z.ZodType<Omit<ModifierGroup, ColumnTimestampProperties>>;

export type ProductModifierGroupSchemaValue = z.infer<
  typeof productModifierGroupSchema
>;

export const createProductModifierGroupSchema = productModifierGroupSchema
  .extend({
    modifiers: z.array(createProductModifierSchema).optional(),
  })
  .omit({ id: true });

export type CreateProductModifierGroupSchemaValue = z.infer<
  typeof createProductModifierGroupSchema
>;

// `id` is optional so a group being added to a category during an update
// can be created rather than matched to an existing row.
export const updateProductModifierGroupSchema =
  productModifierGroupSchema.extend({
    id: z.uuid().optional(),
    modifiers: z.array(updateProductModifierSchema).optional(),
  });

export type UpdateProductModifierGroupSchemaValue = z.infer<
  typeof updateProductModifierGroupSchema
>;

export type ModifierGroupFieldValue = z.input<
  typeof createProductModifierGroupSchema
>;
