import { queryOptions } from '@tanstack/react-query';
import {
  getCategories,
  getCategoriesWithGroups,
  getCategoriesWithGroupsModifiers,
} from '../api/product-category.api';

export const productQueries = {
  categories: () => {
    return queryOptions({
      queryKey: ['product-categories'],
      queryFn: () => getCategories(),
    });
  },
  categoriesWithGroups: () => {
    return queryOptions({
      queryKey: ['product-categories-groups'],
      queryFn: () => getCategoriesWithGroups(),
    });
  },
  categoriesWithGroupsModifiers: () => {
    return queryOptions({
      queryKey: ['product-categories-groups-modifiers'],
      queryFn: () => getCategoriesWithGroupsModifiers(),
    });
  },
};
