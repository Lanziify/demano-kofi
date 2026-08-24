import 'server-only';

import { DatabaseError, ValidationError } from '@/lib/errors/app-error';
import { MediaRepository } from '@/repository/media.repository';
import { db } from '@/utils/db';
import { ModifierGroupRepository } from '../repository/modifier-group.repository';
import { ModifierGroupOptionRepository } from '../repository/modifier-option.repository';
import { ProductRepository } from '../repository/product.repository';
import type { ProductFormValues } from '../schema/product.schema';
import { variantsSchema } from '../schema/variants.schema';
import type { ProductEmbedded } from '../types/types';
import { ProductImageService } from './product-image.service';

export class ProductService {
  constructor(
    private readonly imageService = new ProductImageService(),
    private readonly productRepository = new ProductRepository(),
    private readonly mediaRepository = new MediaRepository(),
    private readonly modifierGroupRepository = new ModifierGroupRepository(),
    private readonly modifierGroupOptionRepository = new ModifierGroupOptionRepository()
  ) {}

  async getProducts() {
    const products = await this.productRepository.findAll();

    return products.map((product) => ({
      ...product,
      images: product.images.map((image) => ({
        ...image,
        url: this.imageService.getPublicUrl(image.storageKey),
      })),
    }));
  }

  async getProductById(id: string) {
    const product = await this.productRepository.findById(id);

    return {
      ...product,
      images: product?.images.map((image) => ({
        ...image,
        url: this.imageService.getPublicUrl(image.storageKey),
      })),
    } as ProductEmbedded[number];
  }

  async createProduct(values: ProductFormValues) {
    const productId = crypto.randomUUID();
    const uploadObjects: Awaited<ReturnType<ProductImageService['createImageObjects']>> = [];

    try {
      if (values.images && values.images.length > 0) {
        const imageObjects = await this.imageService.createImageObjects(productId, values.images);
        uploadObjects.push(...imageObjects);
      }

      const product = await db.transaction().execute(async (trx) => {
        const productRepo = this.productRepository.withTransaction(trx);
        const mediaRepo = this.mediaRepository.withTransaction(trx);
        const modifierGroupRepo = this.modifierGroupRepository.withTransaction(trx);
        const modifierGroupOptionRepo = this.modifierGroupOptionRepository.withTransaction(trx);

        const product = await productRepo.create({
          id: productId,
          categoryId: values.categoryId,
          name: values.name,
          description: values.description,
          isAvailable: values.isAvailable,
          isFeatured: values.isFeatured,
        });

        if (!product) {
          throw new DatabaseError('An error has occurred while trying to store product');
        }

        const { variants, modifierGroups } = values;

        const processedImages: Parameters<ProductRepository['createManyImages']>[0] = [];
        const processedVariants: Parameters<ProductRepository['createManyVariant']>[0] = [];
        const processedModifierGroups: Parameters<ProductRepository['createManyModifierGroup']>[0] = [];
        const processedModifierOptions: Parameters<ProductRepository['createManyModifierOption']>[0] = [];

        uploadObjects.forEach((object) => {
          processedImages.push({
            altText: object.altText,
            mediaId: object.media.id,
            productId: product.id,
            sortOrder: object.sortOrder,
          });
        });

        for (const variant of variants ?? []) {
          const { data, error } = variantsSchema
            .omit({ id: true, productId: true, createdAt: true, updatedAt: true })
            .safeParse(variant);

          if (error) {
            throw new ValidationError(error.message);
          }

          processedVariants.push({
            ...data,
            productId: product.id,
          });
        }

        for (const {
          id: _,
          presetId: categoryModifierGroupId,
          sortOrder,
          isRequired,
          options,
          ...modifierGroupData
        } of modifierGroups ?? []) {
          if (!categoryModifierGroupId) {
            const group = await modifierGroupRepo.create(modifierGroupData);

            if (!group) {
              throw new DatabaseError('An error has occurred while trying to store modifier group');
            }

            for (const { id: _, ...optionData } of options ?? []) {
              const optionResult = await modifierGroupOptionRepo.create({
                ...optionData,
                modifierGroupId: group.id,
              });

              if (!optionResult) {
                throw new DatabaseError('An error has occurred while trying to store modifier group option');
              }

              processedModifierOptions.push({
                productId: product.id,
                modifierOptionId: optionResult.id,
                modifierGroupId: group.id,
                priceAdjustment: optionData.priceAdjustment,
                sortOrder: optionData.sortOrder,
              });
            }

            processedModifierGroups.push({
              productId: product.id,
              categoryModifierGroupId: null,
              modifierGroupId: group.id,
              isRequired,
              sortOrder,
            });

            continue;
          }

          for (const option of options ?? []) {
            if (!option.id) {
              const optionResult = await modifierGroupOptionRepo.create({
                ...option,
                modifierGroupId: categoryModifierGroupId,
              });

              if (!optionResult) {
                throw new DatabaseError('An error has occurred while trying to store modifier group option');
              }

              processedModifierOptions.push({
                productId: product.id,
                modifierOptionId: optionResult.id,
                modifierGroupId: categoryModifierGroupId,
                priceAdjustment: option.priceAdjustment,
                sortOrder: option.sortOrder,
              });

              continue;
            }

            processedModifierOptions.push({
              productId: product.id,
              modifierOptionId: option.id,
              modifierGroupId: categoryModifierGroupId,
              priceAdjustment: option.priceAdjustment,
              sortOrder: option.sortOrder,
            });
          }
        }

        if (uploadObjects.length > 0) {
          await mediaRepo.createMany(uploadObjects.map((object) => object.media));
        }

        if (processedImages.length > 0) {
          await productRepo.createManyImages(processedImages);
        }

        if (processedVariants.length > 0) {
          await productRepo.createManyVariant(processedVariants);
        }

        if (processedModifierGroups.length > 0) {
          await productRepo.createManyModifierGroup(processedModifierGroups);
        }

        if (processedModifierOptions.length > 0) {
          await productRepo.createManyModifierOption(processedModifierOptions);
        }

        return product;
      });

      return product;
    } catch (error) {
      await this.imageService.removeImageObjects(uploadObjects);
      throw error;
    }
  }
}
