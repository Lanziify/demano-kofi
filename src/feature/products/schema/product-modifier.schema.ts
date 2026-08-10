import type { Selectable } from 'kysely';
import z from 'zod';
import type { ProductModifiers } from '@/types/db';

type Modifier = Selectable<ProductModifiers>;

export const productModifierSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1, 'Please enter product modifier name').max(255),
  priceAdjustment: z.number('Please enter a valid number').int(),
}) satisfies z.ZodType<Partial<Omit<Modifier, ColumnTimestampProperties>>>;

export type ProductModifierSchemaValue = z.infer<typeof productModifierSchema>;

export const createProductModifierSchema = productModifierSchema
  .extend({
    modifierGroupId: z.uuid(),
  })
  .omit({
    id: true,
  });

export type CreateModifierSchemaValue = z.infer<
  typeof createProductModifierSchema
>;

// `id` is optional so a modifier being added to an existing group during a
// category update can be created rather than matched to an existing row.
export const updateProductModifierSchema = productModifierSchema.extend({
  id: z.uuid().optional(),
});

export type UpdateProductModifierSchemaValue = z.infer<
  typeof updateProductModifierSchema
>;
