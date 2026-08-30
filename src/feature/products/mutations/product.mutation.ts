'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct, updateProduct } from '../api/product.api';

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
