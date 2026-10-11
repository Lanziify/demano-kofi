import type { Selectable } from 'kysely';
import z from 'zod';
import type { OptionGroups, Options } from '@/core/db/types';

/**
 * Option schema
 */
export const optionSchema = z.object({
  id: z.uuid(),
  optionGroupId: z.uuid(),
  name: z.string().trim().min(1, 'Please enter an option name').max(255, 'Option name too long'),
  priceAdjustment: z.number('Please enter a price adjustment').int().nonnegative(),
  isAvailable: z.boolean(),
  sortOrder: z.number().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies z.ZodType<Selectable<Options>>;

export type OptionValues = z.infer<typeof optionSchema>;

/**
 * Option group schema
 */
export const optionGroupSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  name: z.string().trim().min(1, 'Please enter a group name').max(255, 'Group name too long'),
  minSelect: z.number('Please enter a valid number').int().nonnegative('Minimum cannot be negative'),
  // Null = no upper limit.
  maxSelect: z.number('Please enter a valid number').int().positive('Maximum must be at least 1').nullable(),
  sortOrder: z.number().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies z.ZodType<Selectable<OptionGroups>>;

export type OptionGroupValues = z.infer<typeof optionGroupSchema>;

/**
 * Option form schema
 */
export const optionFormSchema = optionSchema
  .omit({ id: true, optionGroupId: true, createdAt: true, updatedAt: true })
  .extend({
    id: z.uuid().optional(),
  });

export type OptionFormValues = z.infer<typeof optionFormSchema>;

/**
 * Option group form schema with its options
 */
export const optionGroupFormSchema = optionGroupSchema
  .omit({ id: true, productId: true, createdAt: true, updatedAt: true })
  .extend({
    id: z.uuid().optional(),
    options: z.array(optionFormSchema).optional(),
  })
  .superRefine((group, ctx) => {
    if (group.maxSelect !== null && group.maxSelect < group.minSelect) {
      ctx.addIssue({ code: 'custom', path: ['maxSelect'], message: 'Maximum cannot be less than minimum' });
    }

    const optionCount = group.options?.length ?? 0;

    if (group.minSelect > optionCount) {
      ctx.addIssue({
        code: 'custom',
        path: ['minSelect'],
        message: `Only ${optionCount} option${optionCount === 1 ? '' : 's'} to choose from`,
      });
    }
  });

export type OptionGroupFormValues = z.infer<typeof optionGroupFormSchema>;

export type OptionGroupFormFields = z.input<typeof optionGroupFormSchema>;
