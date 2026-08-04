import axios from 'axios';
import type {
  DeleteProductCategoryApiResponse,
  ProductCategoryApiResponse,
  UpdateProductCategoryApiResponse,
} from '@/app/api/products/categories/[id]/route';
import type {
  CreateProductCategoryApiResponse,
  ProductCategoriesApiResponse,
} from '@/app/api/products/categories/route';
import { withClientErrorHandling } from '@/lib/errors/client-error-parser';
import type { FindManyCategoriesOptions } from '../repository/product-category.repository';
import type { ProductCategorySchemaValues } from '../schema/schema';

export const getCategories = withClientErrorHandling(
  async (options?: FindManyCategoriesOptions) => {
    const { data } = await axios.get<ProductCategoriesApiResponse>(
      '/api/products/categories',
      { params: options }
    );

    return data;
  }
);

export const getCategory = withClientErrorHandling(async (id: string) => {
  const { data } = await axios.get<ProductCategoryApiResponse>(
    `/api/products/categories/${id}`
  );

  return data;
});

//#region Mutations
export const createCategory = withClientErrorHandling(
  async (values: ProductCategorySchemaValues) => {
    const { data } = await axios.post<CreateProductCategoryApiResponse>(
      '/api/products/categories',
      values
    );

    return data;
  }
);

export const updateCategory = withClientErrorHandling(
  async ({
    id,
    values,
  }: {
    id: string;
    values: ProductCategorySchemaValues;
  }) => {
    const { data } = await axios.patch<UpdateProductCategoryApiResponse>(
      `/api/products/categories/${id}`,
      values
    );

    return data;
  }
);

export const deleteCategory = withClientErrorHandling(async (id: string) => {
  const { data } = await axios.delete<DeleteProductCategoryApiResponse>(
    `/api/products/categories/${id}`
  );

  return data;
});
//#endregion
