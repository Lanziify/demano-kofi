import type { Selectable } from 'kysely';
import z from 'zod';
import type { ProductVariants } from '@/types/db';

type Variant = Selectable<ProductVariants>;

export const productVariantSchema = z.object({
  productId: z.uuid(),
  sku: z.string().trim().min(1, 'Please enter a SKU.').max(50),
  name: z.string().trim().min(1, 'Please enter a variant name.').max(255),
  price: z.union([
    z.literal('').refine(() => false, {
      message: 'Please enter a price.',
    }),
    z
      .number('Please enter a valid number.')
      .int()
      .nonnegative('Please enter a valid number.'),
  ]),
}) satisfies z.ZodType<
  Partial<Omit<Variant, 'price' | ColumnTimestampProperties>>
>;

export type ProductVariantSchemaValue = z.infer<typeof productVariantSchema>;

export const createProductVariantSchema = productVariantSchema.omit({
  productId: true,
});

export type CreateProductVariantSchemaValue = z.infer<
  typeof createProductVariantSchema
>;

export type ProductVariantFieldValue = z.input<
  typeof createProductVariantSchema
>;
