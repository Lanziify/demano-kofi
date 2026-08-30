import type { Selectable } from 'kysely';
import z from 'zod';
import type { ModifierGroupOptions, ModifierGroups } from '@/types/db';

export const modifierGroupOptionsSchema = z.object({
  id: z.uuid(),
  modifierGroupId: z.uuid(),
  name: z.string().min(1, 'Please enter an option name').max(255, 'Option name too long'),
  priceAdjustment: z.number('Please enter a valid number').int().nonnegative(),
  sortOrder: z.number().nonnegative(),
  // Null = shared/template option. Non-null = private, owned by that one product.
  productId: z.uuid().nullable(),
}) satisfies z.ZodType<Omit<Selectable<ModifierGroupOptions>, ColumnTimestampProperties>>;

export type ModifierGroupOptionsValue = z.infer<typeof modifierGroupOptionsSchema>;

/**
 * Modifier group schema
 */
export const modifierGroupSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1, 'Please enter a modifier group name').max(255, 'Modifier group name too long'),
  selectionType: z.enum(['multiple', 'single']),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies z.ZodType<Selectable<ModifierGroups>>;

export type ModifierGroupValues = z.infer<typeof modifierGroupSchema>;

/**
 * Modifier group option schema
 */
export const modifierGroupOptionSchema = z.object({
  id: z.uuid(),
  modifierGroupId: z.uuid(),
  name: z.string().min(1, 'Please enter a modifier group name').max(255, 'Modifier group name too long'),
  priceAdjustment: z.number('Please enter a valid number').int().nonnegative(),
  sortOrder: z.number().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Null = shared/template option. Non-null = private, owned by that one product.
  productId: z.uuid().nullable(),
}) satisfies z.ZodType<Selectable<ModifierGroupOptions>>;

export type ModifierGroupOptionValues = z.infer<typeof modifierGroupOptionSchema>;

/**
 * Modifier group form schema
 */
export const modifierGroupFormSchema = modifierGroupSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    id: z.uuid().optional(),
  });

export type ModifierGroupFormValues = z.infer<typeof modifierGroupFormSchema>;

/**
 * Modifier group option form schema
 */
export const modifierGroupOptionFormSchema = modifierGroupOptionSchema
  .omit({
    id: true,
    modifierGroupId: true,
    createdAt: true,
    updatedAt: true,
    // Ownership is decided server-side (custom group vs. a product's private addition
    // to a preset), never submitted directly by the client.
    productId: true,
  })
  .extend({
    id: z.uuid().optional(),
    modifierGroupId: z.uuid().optional(),
  });

export type ModifierGroupOptionFormValues = z.infer<typeof modifierGroupOptionFormSchema>;

/**
 * Modifier form schema with modifier group options
 */
export const modifierGroupFormWithOptionsSchema = modifierGroupFormSchema.extend({
  options: z.array(modifierGroupOptionFormSchema).optional()
});

export type ModifierGroupFormWithOptionsValues = z.infer<typeof modifierGroupFormWithOptionsSchema>;

export type ModifierGroupWithOptionsFormFields = z.input<typeof modifierGroupFormWithOptionsSchema>
