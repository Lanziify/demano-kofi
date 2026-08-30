import axios from 'axios';
import { withClientErrorHandling } from '@/lib/errors/client-error-parser';
import type { ApiSuccessResponse } from '@/types/api';
import type { ProductFormValues } from '../schema/product.schema';
import type { Product, ProductEmbedded } from '../types/types';

export const getProducts = withClientErrorHandling(async () => {
  const { data } = await axios.get<ApiSuccessResponse<ProductEmbedded>>('/api/products');

  return data;
});

export const createProduct = withClientErrorHandling(async (values: ProductFormValues) => {
  const { images, ...payload } = values;

  const formData = new FormData();

  formData.append('data', JSON.stringify({ ...payload, images: images?.map(({ file, ...image }) => image) }));

  for (const image of images ?? []) {
    formData.append('images', image.file);
  }

  const { data } = await axios.post<ApiSuccessResponse<Product>>('/api/products', formData);

  return data;
});

export const updateProduct = withClientErrorHandling(async (values: ProductFormValues) => {
  const { images, ...payload } = values;

  const formData = new FormData();

  formData.append('data', JSON.stringify({ ...payload, images: images?.map(({ file, ...image }) => image) }));

  for (const image of images ?? []) {
    if (image.file) {
      formData.append('images', image.file);
    }
  }

  const { data } = await axios.patch<ApiSuccessResponse<Product>>(`/api/products/${values.id}`, formData);

  return data;
});
