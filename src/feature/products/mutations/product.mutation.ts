'use client';

import { useMutation } from '@tanstack/react-query';
import { createProduct } from '../api/product.api';

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: createProduct,
  });
};
