import { useQueries } from '@tanstack/react-query';
import { productCategoryQueries } from '../queries/product-category.queries';
import type { FindManyCategoriesOptions } from '../repository/product-category.repository';

type ProductCategoryQueriesHookProps = {
  id?: string;
  options?: FindManyCategoriesOptions;
};

export const useProductCategoryQueries = ({
  id,
  options,
}: ProductCategoryQueriesHookProps = {}) => {
  const [categories, category] = useQueries({
    queries: [
      productCategoryQueries.list(options),
      { ...productCategoryQueries.detail(id ?? ''), enabled: !!id },
    ],
  });

  return {
    categories,
    category,
  };
};
