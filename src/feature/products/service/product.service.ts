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

    return await db.transaction().execute(async (trx) => {
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

      if (images) {
        
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
  }

  // async updateProduct(id: string, values: ProductSchemaValues) {
  //   const product = await this.repository.update(id, values);

  //   if (!product) {
  //     throw new NotFoundError('Product not found', {
  //       errorCode: 'PRODUCT_NOT_FOUND',
  //     });
  //   }

  //   return product;
  // }

  // async deleteProduct(id: string) {
  //   const product = await this.repository.delete(id);

  //   if (!product) {
  //     throw new NotFoundError('Product not found', {
  //       errorCode: 'PRODUCT_NOT_FOUND',
  //     });
  //   }

  //   return product;
  // }

  // async getProduct(id: string) {
  //   const product = await this.repository.findById(id);

  //   if (!product) {
  //     throw new NotFoundError('Product not found', {
  //       errorCode: 'PRODUCT_NOT_FOUND',
  //     });
  //   }

  //   return product;
  // }

  // async getAllProducts() {
  //   return await this.repository.findAll();
  // }

  // async getProducts(options: FindManyProductsOptions) {
  //   return await this.repository.findMany(options);
  // }
}
