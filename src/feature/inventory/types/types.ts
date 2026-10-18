import type { Selectable } from 'kysely';
import type { InventoryCategories, InventoryItems } from '@/core/db/types';

export type InventoryCategory = Selectable<InventoryCategories>;

export type InventoryItem = Selectable<InventoryItems>;