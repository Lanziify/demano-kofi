import type { Selectable } from 'kysely';
import type { Categories, OptionGroups, Options, ProductAddOns, Products } from '@/core/db/types';
import type { ProductService } from '../service/product.service';

export type Product = Selectable<Products>;

export type ProductEmbedded = Awaited<ReturnType<ProductService['getProducts']>>;

export type Category = Selectable<Categories>;

export type OptionGroup = Selectable<OptionGroups>;
export type Option = Selectable<Options>;
export type OptionGroupWithOptions = OptionGroup & { options: Option[] };

export type ProductAddOn = Selectable<ProductAddOns>;
