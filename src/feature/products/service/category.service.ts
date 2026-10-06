import { DatabaseError, NotFoundError, ValidationError } from '@/lib/errors/app-error';
import { CategoryRepository } from '../repository/category.repository';
import type { CategoryFormValues } from '../schema/category.schema';

export class CategoryService {
  constructor(private readonly categoryRepository = new CategoryRepository()) {}

  async createCategory(values: CategoryFormValues) {
    const { id: _, ...categoryData } = values;

    const category = await this.categoryRepository.create(categoryData);

    if (!category) {
      throw new DatabaseError('An error has occurred while trying to store category');
    }

    return category;
  }

  async updateCategory(values: CategoryFormValues) {
    const { id, ...categoryData } = values;

    if (!id) {
      throw new ValidationError('Missing category ID', {
        errorCode: 'VALIDATION_ERROR',
      });
    }

    const updated = await this.categoryRepository.update({ ...categoryData, id });

    if (!updated) {
      throw new NotFoundError('Category not found', {
        errorCode: 'CATEGORY_NOT_FOUND',
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
