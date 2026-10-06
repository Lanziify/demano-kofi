import { useQueries } from '@tanstack/react-query';
import { productQueries } from '../queries/products.queries';

export const useProducts = () => {
  const [categories, products] = useQueries({
    queries: [productQueries.categories(), productQueries.products()],
  });

  return {
    categories,
    products,
  };
};
