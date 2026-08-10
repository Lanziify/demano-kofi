import axios from 'axios';
import type { UpdateProductCategoryApiResponse } from '@/app/api/products/categories/[id]/route';
import type {
  CreateProductCategoryApiResponse,
  GetProductCategoriesApiResponseMap,
} from '@/app/api/products/categories/route';
import { withClientErrorHandling } from '@/lib/errors/client-error-parser';
import type {
  CreateProductCategorySchemaValue,
  UpdateProductCategorySchemaValue,
} from '../schema/product-category.schema';

export const getCategories = withClientErrorHandling(async () => {
  const { data } = await axios.get<
    GetProductCategoriesApiResponseMap['category']
  >('/api/products/categories');

  return data;
});

export const getCategoriesWithGroups = withClientErrorHandling(async () => {
  const { data } = await axios.get<
    GetProductCategoriesApiResponseMap['groups']
  >('/api/products/categories', {
    params: {
      include: 'groups',
    },
  });

  return data;
});

export const getCategoriesWithGroupsModifiers = withClientErrorHandling(
  async () => {
    const { data } = await axios.get<
      GetProductCategoriesApiResponseMap['groupsModifiers']
    >('/api/products/categories', {
      params: {
        include: 'groupsModifiers',
      },
    });

    return data;
  }
);

//#region Category Mutations
export const createCategory = withClientErrorHandling(
  async (values: CreateProductCategorySchemaValue) => {
    const { data } = await axios.post<CreateProductCategoryApiResponse>(
      '/api/products/categories',
      values
    );

    return data;
  }
);

export const updateCategory = withClientErrorHandling(
  async (values: UpdateProductCategorySchemaValue) => {
    const { data } = await axios.patch<UpdateProductCategoryApiResponse>(
      `/api/products/categories/${values.id}`,
      values
    );

    return data;
  }
);
//#endregion
