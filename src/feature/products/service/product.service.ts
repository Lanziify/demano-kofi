import 'server-only';

import z from 'zod';
import { db } from '@/core/db/db';
import { DatabaseError, NotFoundError, ValidationError } from '@/core/errors/app-error';
import { MediaRepository } from '@/core/media/media.repository';
import { OutboxRepository } from '@/core/outbox/outbox.repository';
import type { CreateOutboxEventValues } from '@/core/outbox/outbox.schema';
import { OptionGroupRepository } from '../repository/option-group.repository';
import { ProductRepository } from '../repository/product.repository';
import type { ProductAddOnFormValues } from '../schema/add-on.schema';
import type { OptionGroupFormValues } from '../schema/option-group.schema';
import type { ProductFormValues } from '../schema/product.schema';
import type { ProductImageFormValues, ProductImageProcessRequestedPayload } from '../schema/product-image.schema';
import { variantsSchema } from '../schema/variants.schema';
import type { ProductEmbedded } from '../types/types';
import { ProductImageService } from './product-image.service';

type ExistingProduct = NonNullable<Awaited<ReturnType<ProductRepository['findById']>>>;
type ExistingOptionGroups = ExistingProduct['optionGroups'];
type ExistingAddOns = ExistingProduct['addOns'];

export class ProductService {
  constructor(
    private readonly imageService = new ProductImageService(),
    private readonly productRepository = new ProductRepository(),
    private readonly mediaRepository = new MediaRepository(),
    private readonly outboxRepository = new OutboxRepository(),
    private readonly optionGroupRepository = new OptionGroupRepository()
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

  /** Returns null for an unknown or malformed id, so callers can 404 instead of querying with a bad uuid. */
  async getProductById(id: string): Promise<ProductEmbedded[number] | null> {
    if (!z.uuid().safeParse(id).success) {
      return null;
    }

    const product = await this.productRepository.findById(id);

    if (!product) {
      return null;
    }

    return {
      ...product,
      images: product.images.map((image) => ({
        ...image,
        url: this.imageService.getPublicUrl(image.storageKey),
      })),
    };
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
        const optionGroupRepo = this.optionGroupRepository.withTransaction(trx);

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

        const { variants } = values;

        const processedImages: Parameters<ProductRepository['createManyImages']>[0] = [];
        const processedVariants: Parameters<ProductRepository['createManyVariant']>[0] = [];

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

        await this.syncOptionGroups(optionGroupRepo, product.id, values.optionGroups ?? [], []);
        await this.syncAddOns(productRepo, product.id, values.addOns ?? [], []);

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
        const optionGroupRepo = this.optionGroupRepository.withTransaction(trx);

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

        // --- Option groups: diff against existing, update kept rows in place ---
        await this.syncOptionGroups(optionGroupRepo, productId, values.optionGroups ?? [], existing.optionGroups);

        // --- Add-ons: drop unlinked products, upsert the rest ---
        await this.syncAddOns(productRepo, productId, values.addOns ?? [], existing.addOns);

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

  /**
   * Brings a product's option groups (and their options) in line with the submitted list.
   * Ids are only trusted when they match a row already owned by this product - anything
   * else is treated as new, so a client can never edit another product's groups.
   */
  private async syncOptionGroups(
    optionGroupRepo: OptionGroupRepository,
    productId: string,
    submittedGroups: OptionGroupFormValues[],
    existingGroups: ExistingOptionGroups
  ) {
    const existingGroupsById = new Map(existingGroups.map((group) => [group.id, group]));
    const keptGroupIds = new Set(
      submittedGroups.map((group) => group.id).filter((id) => id && existingGroupsById.has(id))
    );

    await optionGroupRepo.deleteGroupsByIds(
      productId,
      existingGroups.filter((group) => !keptGroupIds.has(group.id)).map((group) => group.id)
    );

    const newOptions: Parameters<OptionGroupRepository['createManyOptions']>[0] = [];

    for (const { id: submittedGroupId, options = [], ...groupData } of submittedGroups) {
      const existingGroup = submittedGroupId ? existingGroupsById.get(submittedGroupId) : undefined;

      const group = existingGroup
        ? await optionGroupRepo.updateGroup(productId, existingGroup.id, groupData)
        : await optionGroupRepo.createGroup({ ...groupData, productId });

      if (!group) {
        throw new DatabaseError('An error has occurred while trying to store option group');
      }

      const existingOptionIds = new Set(existingGroup?.options.map((option) => option.id));
      const keptOptionIds = new Set(options.map((option) => option.id).filter((id) => id && existingOptionIds.has(id)));

      await optionGroupRepo.deleteOptionsByIds(
        group.id,
        [...existingOptionIds].filter((id) => !keptOptionIds.has(id))
      );

      for (const { id: optionId, ...optionData } of options) {
        if (optionId && keptOptionIds.has(optionId)) {
          const updated = await optionGroupRepo.updateOption(group.id, optionId, optionData);

          if (!updated) {
            throw new DatabaseError('An error has occurred while trying to update option');
          }

          continue;
        }

        newOptions.push({ ...optionData, optionGroupId: group.id });
      }
    }

    if (newOptions.length > 0) {
      await optionGroupRepo.createManyOptions(newOptions);
    }
  }

  private async syncAddOns(
    productRepo: ProductRepository,
    productId: string,
    submittedAddOns: ProductAddOnFormValues[],
    existingAddOns: ExistingAddOns
  ) {
    if (submittedAddOns.some((addOn) => addOn.addOnProductId === productId)) {
      throw new ValidationError('A product cannot be its own add-on', { errorCode: 'VALIDATION_ERROR' });
    }

    const submittedIds = new Set(submittedAddOns.map((addOn) => addOn.addOnProductId));

    await productRepo.deleteAddOns(
      productId,
      existingAddOns.map((addOn) => addOn.addOnProductId).filter((id) => !submittedIds.has(id))
    );

    await productRepo.upsertManyAddOns(submittedAddOns.map((addOn) => ({ ...addOn, productId })));
  }
}
