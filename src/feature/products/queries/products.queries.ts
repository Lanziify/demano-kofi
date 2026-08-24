import { queryOptions } from '@tanstack/react-query';
import { getProducts } from '../api/product.api';
import { getCategories, getCategoriesWithGroupOptions } from '../api/product-category.api';

export const productQueries = {
  categories: () => {
    return queryOptions({
      queryKey: ['categories'],
      queryFn: () => getCategories(),
    });
  },

  categoriesWithGroupOptions: () => {
    return queryOptions({
      queryKey: ['category-modifier-group-options'],
      queryFn: () => getCategoriesWithGroupOptions(),
    });
  },

  products: () => {
    return queryOptions({
      queryKey: ['products'],
      queryFn: () => getProducts(),
    });
  },
};
