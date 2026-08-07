import { DatabaseError } from '@/lib/errors/app-error';
import { db } from '@/utils/db';
import { ProductRepository } from '../repository/product.repository';
import { ProductVariantRepository } from '../repository/product-variant.repository';
import type { CreateProductSchemaValue } from '../schema/product.schema';
import { ProductCategoryService } from './product-category.service';
import { ProductImageService } from './product-image.service';

export class ProductService {
  constructor(
    private readonly productRepository = new ProductRepository(),
    private readonly variantRepository = new ProductVariantRepository(),
    private readonly categoryService = new ProductCategoryService(),
    private readonly imageService = new ProductImageService()
  ) {}

  async createProduct(values: CreateProductSchemaValue) {
    const { images, category, variants, ...data } = values;

    const product = await db.transaction().execute(async (trx) => {
      if (category) {
        const createdCategory = await this.categoryService.createCategory(
          category,
          trx
        );

        data.categoryId = createdCategory.id;
      }

      const repo = this.productRepository.withTransaction(trx);

      const product = await repo.create(data);

      if (!product) {
        throw new DatabaseError(
          'An error has occurred while trying to store product'
        );
      }

      await this.variantRepository.createMany(
        variants.map((variant) => ({
          ...variant,
          productId: product.id,
        })),
        trx
      );

      return product;
    });

    if (images?.length) {
      await this.imageService.addImages(product.id, images);
    }

    return product
  }
}
