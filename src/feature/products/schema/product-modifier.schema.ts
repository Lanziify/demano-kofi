import type { Selectable } from 'kysely';
import z from 'zod';
import type { ProductModifiers } from '@/types/db';

type ColumnTimestampProperties = 'createdAt' | 'updatedAt';

type Modifier = Selectable<ProductModifiers>;

export const createProductModifierSchema = z.object({
  name: z.string().trim().min(1).max(255),
  priceAdjustment: z.number().int(),
}) satisfies z.ZodType<
  Partial<Omit<Modifier, 'id' | ColumnTimestampProperties>>
>;

export type CreateModifierSchemaValue = z.infer<typeof createProductModifierSchema>;
