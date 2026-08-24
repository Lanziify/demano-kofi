import axios from 'axios';
import { withClientErrorHandling } from '@/lib/errors/client-error-parser';
import type { ApiSuccessResponse } from '@/types/api';
import type { CategoryFormWithModifierGroupsValue } from '../schema/category.schema';
import type { Category, CategoryWithModifierGroupOptions } from '../types/types';

export const getCategories = withClientErrorHandling(async () => {
  const { data } = await axios.get<ApiSuccessResponse<Category[]>>('/api/products/categories');

  return data;
});

export const getCategoriesWithGroupOptions = withClientErrorHandling(async () => {
  const { data } = await axios.get<ApiSuccessResponse<CategoryWithModifierGroupOptions[]>>('/api/products/categories', {
    params: {
      include: 'groupModifierOptions',
    },
  });

  return data;
});

//#region Category Mutations
export const createCategory = withClientErrorHandling(async (values: CategoryFormWithModifierGroupsValue) => {
  const { data } = await axios.post<ApiSuccessResponse<Category>>('/api/products/categories', values);

  return data;
});

export const updateCategory = withClientErrorHandling(async (values: CategoryFormWithModifierGroupsValue) => {
  const { data } = await axios.patch<ApiSuccessResponse<Category>>(`/api/products/categories/${values.id}`, values);

  return data;
});
//#endregion
