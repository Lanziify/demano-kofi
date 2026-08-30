import 'server-only';

import { DatabaseError, NotFoundError, ValidationError } from '@/lib/errors/app-error';
import { MediaRepository } from '@/repository/media.repository';
import { OutboxRepository } from '@/repository/outbox.repository';
import type { CreateOutboxEventValues } from '@/schema/outbox.schema';
import { db } from '@/utils/db';
import { CategoryModifierGroupRepository } from '../repository/category-modifier-group.repository';
import { ModifierGroupRepository } from '../repository/modifier-group.repository';
import { ModifierGroupOptionRepository } from '../repository/modifier-option.repository';
import { ProductRepository } from '../repository/product.repository';
import type { ProductFormValues } from '../schema/product.schema';
import type { ProductImageFormValues, ProductImageProcessRequestedPayload } from '../schema/product-image.schema';
import { variantsSchema } from '../schema/variants.schema';
import type { ProductEmbedded } from '../types/types';
import { ProductImageService } from './product-image.service';

export class ProductService {
  constructor(
    private readonly imageService = new ProductImageService(),
    private readonly productRepository = new ProductRepository(),
    private readonly mediaRepository = new MediaRepository(),
    private readonly outboxRepository = new OutboxRepository(),
    private readonly modifierGroupRepository = new ModifierGroupRepository(),
    private readonly modifierGroupOptionRepository = new ModifierGroupOptionRepository(),
    private readonly categoryModifierGroupRepository = new CategoryModifierGroupRepository()
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
    const uploadObjects: Awaited<ReturnType<ProductImageService['createOriginalImageObjects']>> = [];

    try {
      if (values.images && values.images.length > 0) {
        const imageObjects = await this.imageService.createOriginalImageObjects(productId, values.images);
        uploadObjects.push(...imageObjects);
      }

      const product = await db.transaction().execute(async (trx) => {
        const productRepo = this.productRepository.withTransaction(trx);
        const mediaRepo = this.mediaRepository.withTransaction(trx);
        const outboxRepo = this.outboxRepository.withTransaction(trx);
        const modifierGroupRepo = this.modifierGroupRepository.withTransaction(trx);
        const modifierGroupOptionRepo = this.modifierGroupOptionRepository.withTransaction(trx);
        const categoryModifierGroupRepo = this.categoryModifierGroupRepository.withTransaction(trx);

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
          selectionType,
          options,
          ...modifierGroupData
        } of modifierGroups ?? []) {
          if (!categoryModifierGroupId) {
            const group = await modifierGroupRepo.create({ ...modifierGroupData, selectionType });

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
              // Custom groups own selectionType directly on modifierGroups - no override needed.
              selectionType: null,
            });

            continue;
          }

          for (const option of options ?? []) {
            if (!option.id) {
              // A brand-new option under a preset group belongs to this product only -
              // never the shared template other products/categories see.
              const optionResult = await modifierGroupOptionRepo.create({
                ...option,
                modifierGroupId: categoryModifierGroupId,
                productId: product.id,
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

          // `categoryModifierGroupId` here is actually modifierGroups.id (see form's handleModifierGroupChange,
          // which reads it from category.modifierGroups[].id - the shared group, not the category_modifier_groups
          // join row). Look up the real category_modifier_groups.id so the FK on this column is meaningful.
          const categoryModifierGroupLink = await categoryModifierGroupRepo.findByCategoryAndModifierGroup(
            values.categoryId,
            categoryModifierGroupId
          );

          processedModifierGroups.push({
            productId: product.id,
            categoryModifierGroupId: categoryModifierGroupLink?.id ?? null,
            modifierGroupId: categoryModifierGroupId,
            isRequired,
            sortOrder,
            selectionType,
          });
        }

        if (uploadObjects.length > 0) {
          await mediaRepo.createMany(uploadObjects.map((object) => object.media));

          const processedImageEvents: CreateOutboxEventValues[] = uploadObjects.map((object) => ({
            eventType: 'product.image.process_requested',
            payload: JSON.stringify({
              productId: product.id,
              mediaId: object.media.id,
              storageKey: object.media.storageKey,
              altText: object.altText,
              sortOrder: object.sortOrder,
            } satisfies ProductImageProcessRequestedPayload),
          }));

          await outboxRepo.createMany(processedImageEvents);
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

  async updateProduct(values: ProductFormValues) {
    if (!values.id) {
      throw new ValidationError('Missing product ID', { errorCode: 'MISSING_ID' });
    }

    const productId = values.id;
    const existing = await this.productRepository.findById(productId);

    if (!existing) {
      throw new NotFoundError('Product not found', { errorCode: 'PRODUCT_NOT_FOUND' });
    }

    const uploadObjects: Awaited<ReturnType<ProductImageService['createOriginalImageObjects']>> = [];
    const removedStorageKeys: string[] = [];

    try {
      if (values.images && values.images.length > 0) {
        const imageObjects = await this.imageService.createOriginalImageObjects(productId, values.images);
        uploadObjects.push(...imageObjects);
      }

      const existingOriginalImages = existing.images.filter((image) => image.type === 'original');
      const submittedMediaIds = new Set(
        (values.images ?? []).map((image) => image.mediaId).filter((mediaId): mediaId is string => Boolean(mediaId))
      );
      const removedMediaIds = existingOriginalImages
        .filter((image) => !submittedMediaIds.has(image.id))
        .map((image) => image.id);
      const keptImages = (values.images ?? []).filter(
        (image): image is ProductImageFormValues & { mediaId: string } => typeof image.mediaId !== 'undefined'
      );

      const product = await db.transaction().execute(async (trx) => {
        const productRepo = this.productRepository.withTransaction(trx);
        const mediaRepo = this.mediaRepository.withTransaction(trx);
        const outboxRepo = this.outboxRepository.withTransaction(trx);
        const modifierGroupRepo = this.modifierGroupRepository.withTransaction(trx);
        const modifierGroupOptionRepo = this.modifierGroupOptionRepository.withTransaction(trx);
        const categoryModifierGroupRepo = this.categoryModifierGroupRepository.withTransaction(trx);

        const product = await productRepo.update(productId, {
          categoryId: values.categoryId,
          name: values.name,
          description: values.description,
          isAvailable: values.isAvailable,
          isFeatured: values.isFeatured,
        });

        if (!product) {
          throw new DatabaseError('An error has occurred while trying to update product');
        }

        // --- Images: removed (delete original + generated variants, both DB rows and storage objects) ---
        for (const mediaId of removedMediaIds) {
          const siblingMedia = await mediaRepo.findByStorageKeyPrefix(`products/${productId}/${mediaId}/`);
          const siblingIds = siblingMedia.map((media) => media.id);

          await productRepo.deleteImagesByMediaIds(productId, siblingIds);
          const deleted = await mediaRepo.deleteManyByIds(siblingIds);

          removedStorageKeys.push(...deleted.map((media) => media.storageKey));
        }

        // --- Images: kept (update sortOrder/altText across every generated variant of this picture) ---
        for (const image of keptImages) {
          const siblingMedia = await mediaRepo.findByStorageKeyPrefix(`products/${productId}/${image.mediaId}/`);

          for (const media of siblingMedia) {
            await productRepo.upsertImage({
              productId,
              mediaId: media.id,
              altText: image.altText,
              sortOrder: image.sortOrder,
            });
          }
        }

        // --- Images: new (same original-only pipeline as create, deferring variants to the outbox worker) ---
        if (uploadObjects.length > 0) {
          await mediaRepo.createMany(uploadObjects.map((object) => object.media));

          const processedImageEvents: CreateOutboxEventValues[] = uploadObjects.map((object) => ({
            eventType: 'product.image.process_requested',
            payload: JSON.stringify({
              productId,
              mediaId: object.media.id,
              storageKey: object.media.storageKey,
              altText: object.altText,
              sortOrder: object.sortOrder,
            } satisfies ProductImageProcessRequestedPayload),
          }));

          await outboxRepo.createMany(processedImageEvents);

          await productRepo.createManyImages(
            uploadObjects.map((object) => ({
              altText: object.altText,
              mediaId: object.media.id,
              productId,
              sortOrder: object.sortOrder,
            }))
          );
        }

        // --- Variants: diff against existing, update in place (never delete-recreate a kept
        // variant, since that would destroy any stock/history rows keyed on its id) ---
        const submittedVariantIds = new Set(
          (values.variants ?? [])
            .map((variant) => variant.id)
            .filter((variantId): variantId is string => Boolean(variantId))
        );

        const removedVariantIds = existing.variants
          .filter((variant) => !submittedVariantIds.has(variant.id))
          .map((variant) => variant.id);

        if (removedVariantIds.length > 0) {
          await productRepo.deleteVariantsByIds(productId, removedVariantIds);
        }

        for (const variant of values.variants ?? []) {
          const { data, error } = variantsSchema
            .omit({ id: true, productId: true, createdAt: true, updatedAt: true })
            .safeParse(variant);

          if (error) {
            throw new ValidationError(error.message);
          }

          if (variant.id) {
            const updated = await productRepo.updateVariant(variant.id, data);

            if (!updated) {
              throw new DatabaseError('An error has occurred while trying to update variant');
            }

            continue;
          }

          const created = await productRepo.createVariant({ ...data, productId });

          if (!created) {
            throw new DatabaseError('An error has occurred while trying to store variant');
          }
        }

        // --- Modifier groups: diff against existing, update custom groups in place ---
        const submittedGroupIds = new Set(
          (values.modifierGroups ?? [])
            .map((group) => group.id)
            .filter((groupId): groupId is string => Boolean(groupId))
        );

        for (const group of existing.modifierGroups) {
          if (submittedGroupIds.has(group.id)) {
            continue;
          }

          await productRepo.deleteModifierOptionsByGroup(productId, group.id);
          await productRepo.deleteModifierGroup(productId, group.id);

          // Only custom groups are exclusively owned by this product - a preset link
          // must never delete the shared modifierGroups/modifierGroupOptions rows.
          if (group.categoryModifierGroupId === null) {
            for (const option of group.options) {
              await modifierGroupOptionRepo.delete(group.id, option.id);
            }

            await modifierGroupRepo.delete(group.id);
          }
        }

        for (const {
          id: groupId,
          presetId: submittedPresetId,
          sortOrder,
          isRequired,
          selectionType,
          options,
          ...modifierGroupData
        } of values.modifierGroups ?? []) {
          const existingGroup = groupId ? existing.modifierGroups.find((g) => g.id === groupId) : undefined;

          // Trust the server's own record of preset-vs-custom over the client's `presetId` for a
          // group that already exists: the repository response the edit form loads its state from
          // has no field called `presetId`, so a previously preset-linked group would otherwise come
          // back through this loop looking custom and hit modifierGroupRepo.update() below - mutating
          // a shared category preset instead of just this product's link to it.
          const isPresetGroup = existingGroup
            ? existingGroup.categoryModifierGroupId !== null
            : Boolean(submittedPresetId);
          const categoryModifierGroupId = existingGroup ? existingGroup.id : submittedPresetId;

          const existingGroupOptions = existingGroup?.options ?? [];
          const keptOptionIds = new Set(
            (options ?? []).map((option) => option.id).filter((optionId): optionId is string => Boolean(optionId))
          );

          if (!isPresetGroup) {
            const group = groupId
              ? await modifierGroupRepo.update({ id: groupId, ...modifierGroupData, selectionType })
              : await modifierGroupRepo.create({ ...modifierGroupData, selectionType });

            if (!group) {
              throw new DatabaseError('An error has occurred while trying to store modifier group');
            }

            // Must happen before any productModifierOptions writes below: product_modifier_options_group_fk
            // requires a matching (productId, modifierGroupId) row in productModifierGroups to already exist.
            await productRepo.upsertModifierGroup({
              productId,
              categoryModifierGroupId: null,
              modifierGroupId: group.id,
              isRequired,
              sortOrder,
              selectionType: null,
            });

            for (const option of existingGroupOptions) {
              if (!keptOptionIds.has(option.id)) {
                await modifierGroupOptionRepo.delete(group.id, option.id);
                await productRepo.deleteModifierOption(productId, group.id, option.id);
              }
            }

            for (const { id: optionId, ...optionData } of options ?? []) {
              const optionResult = optionId
                ? await modifierGroupOptionRepo.update({ id: optionId, modifierGroupId: group.id, ...optionData })
                : await modifierGroupOptionRepo.create({ ...optionData, modifierGroupId: group.id });

              if (!optionResult) {
                throw new DatabaseError('An error has occurred while trying to store modifier group option');
              }

              await productRepo.upsertModifierOption({
                productId,
                modifierOptionId: optionResult.id,
                modifierGroupId: group.id,
                priceAdjustment: optionData.priceAdjustment,
                sortOrder: optionData.sortOrder,
              });
            }

            continue;
          }

          if (!categoryModifierGroupId) {
            throw new ValidationError('Missing modifier group reference for preset selection');
          }

          const categoryModifierGroupLink = await categoryModifierGroupRepo.findByCategoryAndModifierGroup(
            values.categoryId,
            categoryModifierGroupId
          );

          // Must happen before any productModifierOptions writes below - see the same note in the
          // custom-group branch above.
          await productRepo.upsertModifierGroup({
            productId,
            categoryModifierGroupId: categoryModifierGroupLink?.id ?? null,
            modifierGroupId: categoryModifierGroupId,
            isRequired,
            sortOrder,
            selectionType,
          });

          for (const option of existingGroupOptions) {
            if (!keptOptionIds.has(option.id)) {
              await productRepo.deleteModifierOption(productId, categoryModifierGroupId, option.id);

              // A private option belongs to this product alone - remove it entirely
              // rather than leaving an orphaned row nobody else can reach.
              if (option.productId === productId) {
                await modifierGroupOptionRepo.delete(categoryModifierGroupId, option.id);
              }
            }
          }

          for (const { id: optionId, ...optionData } of options ?? []) {
            const existingOption = optionId ? existingGroupOptions.find((o) => o.id === optionId) : undefined;

            const optionResult = !optionId
              ? // Brand-new option under a preset group - private to this product, never the shared template.
                await modifierGroupOptionRepo.create({
                  ...optionData,
                  modifierGroupId: categoryModifierGroupId,
                  productId,
                })
              : existingOption?.productId === productId
                ? // Already private to this product - safe to rename/reprice at the source.
                  await modifierGroupOptionRepo.update({
                    id: optionId,
                    modifierGroupId: categoryModifierGroupId,
                    ...optionData,
                  })
                : // Shared template option - never mutated, only linked/overridden.
                  { id: optionId };

            if (!optionResult) {
              throw new DatabaseError('An error has occurred while trying to store modifier group option');
            }

            await productRepo.upsertModifierOption({
              productId,
              modifierOptionId: optionResult.id,
              modifierGroupId: categoryModifierGroupId,
              priceAdjustment: optionData.priceAdjustment,
              sortOrder: optionData.sortOrder,
            });
          }
        }

        return product;
      });

      if (removedStorageKeys.length > 0) {
        const results = await this.imageService.removeImageObjects(
          removedStorageKeys.map((key) => ({ upload: { key } }))
        );
        const failed = results.filter((result) => result.status === 'rejected');

        if (failed.length > 0) {
          console.error(
            `[product-update] failed to delete ${failed.length} storage object(s) for product ${productId}`,
            failed
          );
        }
      }

      return product;
    } catch (error) {
      await this.imageService.removeImageObjects(uploadObjects);
      throw error;
    }
  }
}
