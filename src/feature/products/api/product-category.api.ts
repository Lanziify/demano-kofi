import axios from 'axios';
import { withClientErrorHandling } from '@/core/errors/client-error-parser';
import type { ApiSuccessResponse } from '@/core/http/api.types';
import type { CategoryFormValues } from '../schema/category.schema';
import type { Category } from '../types/types';

export const getCategories = withClientErrorHandling(async () => {
  const { data } = await axios.get<ApiSuccessResponse<Category[]>>('/api/products/categories');

  return data;
});

//#region Category Mutations
export const createCategory = withClientErrorHandling(async (values: CategoryFormValues) => {
  const { data } = await axios.post<ApiSuccessResponse<Category>>('/api/products/categories', values);

  return data;
});

export const updateCategory = withClientErrorHandling(async (values: CategoryFormValues) => {
  const { data } = await axios.patch<ApiSuccessResponse<Category>>(`/api/products/categories/${values.id}`, values);

  return data;
});
//#endregion
