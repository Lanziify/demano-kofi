import { queryOptions } from '@tanstack/react-query';
import { getCategories, getCategory } from '../api/product-category.api';
import type { FindManyCategoriesOptions } from '../repository/product-category.repository';

export const productCategoryQueries = {
  list: (options?: FindManyCategoriesOptions) => {
    return queryOptions({
      queryKey: ['product-categories', options],
      queryFn: () => getCategories(options),
    });
  },
  detail: (id: string) => {
    return queryOptions({
      queryKey: ['product-categories', id],
      queryFn: () => getCategory(id),
    });
  },
};
