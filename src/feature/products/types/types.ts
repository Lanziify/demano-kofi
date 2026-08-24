import type { Selectable } from 'kysely';
import type { Categories, ModifierGroupOptions, ModifierGroups, Products } from '@/types/db';
import type { ProductService } from '../service/product.service';

export type Product = Selectable<Products>;

export type ProductEmbedded = Awaited<ReturnType<ProductService['getProducts']>>;

export type Category = Selectable<Categories>;
export type CategoryWithModifierGroupOptions = Category & {
  modifierGroups: CategoryModifierGroupsWithSortOrder[];
};

export type CategoryModifierGroupsWithSortOrder = ModifierGroupWithOptions & { sortOrder: number };

export type ModifierGroup = Selectable<ModifierGroups>;
export type ModifierGroupOption = Selectable<ModifierGroupOptions>;
export type ModifierGroupWithOptions = ModifierGroup & { options: ModifierGroupOption[] };
