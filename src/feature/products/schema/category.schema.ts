import type { Selectable } from 'kysely';
import z from 'zod';
import type { Categories, CategoryModifierGroups } from '@/types/db';
import { modifierGroupFormWithOptionsSchema } from './modifier.schema';

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
 * Category modifier group relation schema
 */
export const categoryModifierGroupSchema = z.object({
  id: z.uuid(),
  categoryId: z.uuid(),
  modifierGroupId: z.uuid(),
  sortOrder: z.number().nonnegative(),
}) satisfies z.ZodType<Selectable<CategoryModifierGroups>>;

export const categoryModifierGroupWithoutIdSchema = categoryModifierGroupSchema.omit({id: true})

export type CategoryModifierGroupWithoutIdValues = z.infer<typeof categoryModifierGroupWithoutIdSchema>;

/**
 * Category form schema
 */
export const categoryFormSchema = categorySchema.omit({ id: true, createdAt: true, updatedAt: true }).extend({
  id: z.uuid().optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

/**
 * Category form schema with modifier groups and options
 */
export const categoryModifierGroupFormWithOptionsSchema = modifierGroupFormWithOptionsSchema.extend({
  sortOrder: z.number().nonnegative(),
});

export const categoryFormWithModifierGroupsSchema = categoryFormSchema.extend({
  modifierGroups: z.array(categoryModifierGroupFormWithOptionsSchema).optional(),
});

export type CategoryFormWithModifierGroupsValue = z.infer<typeof categoryFormWithModifierGroupsSchema>;

/**
 * Category Response Values
 */
export const categoryWithModifierGroupsResponseSchema = categoryFormSchema.extend({
  modifierGroups: z.array(modifierGroupFormWithOptionsSchema).optional(),
});

export type CategoryWithModifierGroupsResponseValues = z.infer<typeof categoryWithModifierGroupsResponseSchema>;

/**
 * Category Query Schema
 */
export const categoryQuerySchema = z.object({
  include: z.enum(['groupModifierOptions']).optional(),
});

export type CategoryQuerySchemaValues = z.infer<typeof categoryQuerySchema>;
