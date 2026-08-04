import type { Selectable } from 'kysely';
import z from 'zod';
import type {
  ModifierGroups,
  ProductCategories,
  ProductImages,
  ProductModifierGroups,
  ProductModifiers,
  Products,
  ProductVariants,
} from '@/types/db';

type DefaultColumnProperties = 'id' | 'createdAt' | 'updatedAt';

type Category = Selectable<ProductCategories>;
type Product = Selectable<Products>;
type ProductImage = Selectable<ProductImages>;
type ProductVariant = Selectable<ProductVariants>;
type ModifierGroup = Selectable<ModifierGroups>;
type ProductModifierGroup = Selectable<ProductModifierGroups>;
type ProductModifier = Selectable<ProductModifiers>;

/**
 * Category
 */
export const productCategorySchema = z.object({
  name: z.string().min(1, 'Please enter category name.'),
  description: z.string().nullable(),
}) satisfies z.ZodType<Omit<Category, DefaultColumnProperties>>;

export type ProductCategorySchemaValues = z.infer<typeof productCategorySchema>;

/**
 * Product
 */
export const productSchema = z.object({
  categoryId: z.string(),
  name: z.string().min(1, 'Please enter product name.'),
  description: z.string(),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
}) satisfies z.ZodType<Omit<Product, DefaultColumnProperties>>;

export type ProductSchemaValues = z.infer<typeof productSchema>;

/**
 * Product Image
 */
export const productImageSchema = z.object({
  productId: z.string(),
  imageUrl: z.string().min(1, 'Please provide an image.'),
}) satisfies z.ZodType<Omit<ProductImage, 'id'>>;

export type ProductImageSchemaValues = z.infer<typeof productImageSchema>;

/**
 * Product Variant
 */
export const productVariantSchema = z.object({
  productId: z.string(),
  sku: z.string().min(1, 'Please enter a SKU.'),
  name: z.string().min(1, 'Please enter variant name.'),
  price: z.number().int(),
}) satisfies z.ZodType<Omit<ProductVariant, DefaultColumnProperties>>;

export type ProductVariantSchemaValues = z.infer<typeof productVariantSchema>;

/**
 * Modifier Group
 */
export const modifierGroupSchema = z.object({
  name: z.string().min(1, 'Please enter modifier group name.'),
  selectionType: z.string().min(1, 'Please select a selection type.'),
  isRequired: z.boolean(),
}) satisfies z.ZodType<Omit<ModifierGroup, DefaultColumnProperties>>;

export type ModifierGroupSchemaValues = z.infer<typeof modifierGroupSchema>;

/**
 * Product Modifier Group
 */
export const productModifierGroupSchema = z.object({
  productId: z.string(),
  modifierGroupId: z.string(),
}) satisfies z.ZodType<Omit<ProductModifierGroup, 'id'>>;

export type ProductModifierGroupSchemaValues = z.infer<
  typeof productModifierGroupSchema
>;

/**
 * Product Modifier
 */
export const productModifierSchema = z.object({
  modifierGroupId: z.string(),
  name: z.string().min(1, 'Please enter modifier name.'),
  priceAdjustment: z.number().int(),
}) satisfies z.ZodType<Omit<ProductModifier, 'id'>>;

export type ProductModifierSchemaValues = z.infer<typeof productModifierSchema>;
