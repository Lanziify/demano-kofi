import { useQueries } from '@tanstack/react-query';
import { productQueries } from '../queries/products.queries';

export const useProducts = () => {
  const [categories, categoriesWithGroupOptions, products] = useQueries({
    queries: [productQueries.categories(), productQueries.categoriesWithGroupOptions(), productQueries.products()],
  });

  return {
    categories,
    categoriesWithGroupOptions,
    products,
  };
};
