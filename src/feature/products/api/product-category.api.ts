import axios from 'axios';
import type { CreateProductCategoryApiResponse } from '@/app/api/products/categories/route';
import { withClientErrorHandling } from '@/lib/errors/client-error-parser';
import { safeCatch } from '@/lib/errors/safe-catch';
import type { CreateProductCategorySchemaValue } from '../schema/product-category.schema';

export const createCategory = withClientErrorHandling(
  async (values: CreateProductCategorySchemaValue) => {
    return safeCatch(async () => {
      const { data } = await axios.post<CreateProductCategoryApiResponse>(
        '/api/products/categories',
        values
      );

      return data;
    });
  }
);
