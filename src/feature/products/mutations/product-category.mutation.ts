import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory } from '../api/product-category.api';

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
    },
  });
};
