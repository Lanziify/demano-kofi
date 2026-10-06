'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory, updateCategory } from '../api/product-category.api';

export const useCreateProductCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateProductCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategory,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
