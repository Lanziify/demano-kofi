import z from 'zod';
import type { InventoryItem } from '../types/types';

export const inventoryItemSchema = z.object({
  id: z.uuid(),
  name: z.string('').min(1, 'Please enter item name').max(255, 'Item name is too long'),
  sku: z.string().min(1, 'Please enter SKU').max(50, 'SKU too long'),
  packDescription: z.string(),
  baseUnitId: z.uuid(),
  categoryId: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  archivedAt: z.date(),
}) satisfies z.ZodType<InventoryItem>;

export type InventorySchemaValues = z.infer<typeof inventoryItemSchema>;

export const inventoryItemFormSchema = inventoryItemSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    archivedAt: true,
  })
  .extend({
    stocks: {},
  });
