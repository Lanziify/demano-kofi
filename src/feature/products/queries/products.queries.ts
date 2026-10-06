import { queryOptions } from '@tanstack/react-query';
import { getProducts } from '../api/product.api';
import { getCategories } from '../api/product-category.api';

export const productQueries = {
  categories: () => {
    return queryOptions({
      queryKey: ['categories'],
      queryFn: () => getCategories(),
    });
  },

  products: () => {
    return queryOptions({
      queryKey: ['products'],
      queryFn: () => getProducts(),
    });
  },
};
