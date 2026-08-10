'use client';

import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { createCategory, updateCategory } from '../api/product-category.api';

// Each of these is its own top-level query key (see products.queries.ts), so
// invalidating them requires separate calls — a single call with all three
// as one array key would only match a query key nested under that exact
// three-level path, which none of them are, and silently invalidate nothing.
function invalidateCategoryQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ['product-categories'] });
  queryClient.invalidateQueries({ queryKey: ['product-categories-groups'] });
  queryClient.invalidateQueries({
    queryKey: ['product-categories-groups-modifiers'],
  });
}

export const useCreateProductCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess() {
      invalidateCategoryQueries(queryClient);
    },
  });
};

export const useUpdateProductCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategory,
    onSuccess() {
      invalidateCategoryQueries(queryClient);
    },
  });
};
