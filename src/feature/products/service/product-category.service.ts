import { NotFoundError } from '@/lib/errors/app-error';
import type {
  FindManyCategoriesOptions,
  ProductCategoryRepository,
} from '../repository/product-category.repository';
import type { ProductCategorySchemaValues } from '../schema/schema';

export class ProductCategoryService {
  constructor(private repository: ProductCategoryRepository) {}

  async createCategory(values: ProductCategorySchemaValues) {
    return await this.repository.create(values);
  }

  async updateCategory(id: string, values: ProductCategorySchemaValues) {
    const category = await this.repository.update(id, values);

    if (!category) {
      throw new NotFoundError('Category not found', {
        errorCode: 'CATEGORY_NOT_FOUND',
      });
    }

    return category;
  }

  async deleteCategory(id: string) {
    const category = await this.repository.delete(id);

    if (!category) {
      throw new NotFoundError('Category not found', {
        errorCode: 'CATEGORY_NOT_FOUND',
      });
    }

    return category;
  }

  async getCategory(id: string) {
    const category = await this.repository.findById(id);

    if (!category) {
      throw new NotFoundError('Category not found', {
        errorCode: 'CATEGORY_NOT_FOUND',
      });
    }

    return category;
  }

  async getAllCategories() {
    return await this.repository.findAll();
  }

  async getCategories(options: FindManyCategoriesOptions) {
    return await this.repository.findMany(options);
  }
}
