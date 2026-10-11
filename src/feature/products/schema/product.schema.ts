import type { Selectable } from 'kysely';
import z from 'zod';
import type { Products } from '@/core/db/types';
import { productAddOnFormSchema } from './add-on.schema';
import { optionGroupFormSchema } from './option-group.schema';
import { productImageFormSchema } from './product-image.schema';
import { variantFormSchema } from './variants.schema';

/**
 * Product schema
 */
export const productSchema = z.object({
  id: z.uuid(),
  categoryId: z.uuid('Please select category.'),
  name: z.string().trim().min(1, 'Please enter a product name.').max(255),
  description: z.string().trim(),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies z.ZodType<Selectable<Products>>;

export type ProductValues = z.infer<typeof productSchema>;

/**
 * Product form schema
 */
export const productFormSchema = productSchema.omit({ id: true, createdAt: true, updatedAt: true }).extend({
  id: z.uuid().optional(),
  images: z.array(productImageFormSchema).max(10).optional(),
  variants: z.array(variantFormSchema).optional(),
  optionGroups: z.array(optionGroupFormSchema).optional(),
  addOns: z
    .array(productAddOnFormSchema)
    .refine((addOns) => new Set(addOns.map((addOn) => addOn.addOnProductId)).size === addOns.length, {
      message: 'A product can only be added once.',
    })
    .optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export type ProductFormFields = z.input<typeof productFormSchema>;
