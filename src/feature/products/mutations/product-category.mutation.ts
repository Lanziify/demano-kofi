import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from '../api/product-category.api';

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategory,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
    },
  });
};
