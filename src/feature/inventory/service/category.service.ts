import { DatabaseError, NotFoundError, ValidationError } from '@/core/errors/app-error';
import { InventoryCategoryRepository } from '../repository/category.repository';
import type { InventoryCategoryFormValues } from '../schema/category.schema';

export class InventoryCategoryService {
  constructor(private readonly categoryRepository = new InventoryCategoryRepository()) {}

  async createCategory(values: InventoryCategoryFormValues) {
    const { id: _, ...categoryData } = values;

    const category = await this.categoryRepository.create(categoryData);

    if (!category) {
      throw new DatabaseError('An error has occurred while trying to store category');
    }

    return category;
  }

  async updateCategory(values: InventoryCategoryFormValues) {
    const { id, ...categoryData } = values;

    if (!id) {
      throw new ValidationError('Missing category ID', {
        errorCode: 'VALIDATION_ERROR',
      });
    }

    const updated = await this.categoryRepository.update({ ...categoryData, id });

    if (!updated) {
      throw new NotFoundError('Category not found', {
        errorCode: 'IVENTORY_CATEGORY_NOT_FOUND',
      });
    }

    return updated;
  }

  async getCategories() {
    return await this.categoryRepository.findAll();
  }

  async getCategoryById(id: string) {
    return await this.categoryRepository.findById(id);
  }
}
