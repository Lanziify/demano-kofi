import axios from 'axios';
import { withClientErrorHandling } from '@/core/errors/client-error-parser';
import type { ApiSuccessResponse } from '@/core/http/api.types';
import type { ProductCategoryFormValues } from '../schema/category.schema';
import type { ProductCategory } from '../types/types';

export const getCategories = withClientErrorHandling(async () => {
  const { data } = await axios.get<ApiSuccessResponse<ProductCategory[]>>('/api/products/categories');

  return data;
});

//#region Category Mutations
export const createCategory = withClientErrorHandling(async (values: ProductCategoryFormValues) => {
  const { data } = await axios.post<ApiSuccessResponse<ProductCategory>>('/api/products/categories', values);

  return data;
});

export const updateCategory = withClientErrorHandling(async (values: ProductCategoryFormValues) => {
  const { data } = await axios.patch<ApiSuccessResponse<ProductCategory>>(`/api/products/categories/${values.id}`, values);

  return data;
});
//#endregion
