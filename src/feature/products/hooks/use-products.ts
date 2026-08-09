import { useQueries } from '@tanstack/react-query';
import { productQueries } from '../queries/products.queries';

export type UseProductsProps = {};

export const useProducts = (options?: UseProductsProps) => {
  const [categories, categoriesWithGroups, categoriesWithGroupsModifiers] =
    useQueries({
      queries: [
        productQueries.categories(),
        productQueries.categoriesWithGroups(),
        productQueries.categoriesWithGroupsModifiers(),
      ],
    });

  return {
    categories,
    categoriesWithGroups,
    categoriesWithGroupsModifiers,
  };
};
