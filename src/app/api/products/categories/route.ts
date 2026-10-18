import { NextResponse } from 'next/server';
import type { ApiSuccessResponse } from '@/core/http/api.types';
import { apiErrorHandler, requiredSession } from '@/core/http/api-handler';
import { type ProductCategory, productCategoryFormSchema } from '@/feature/products';
import { ProductCategoryService } from '@/feature/products/server';

const service = new ProductCategoryService();

export const GET = apiErrorHandler(
  async () => {
    const result = await service.getCategories();

    return NextResponse.json<ApiSuccessResponse<ProductCategory[]>>(
      {
        success: true,
        data: result,
        error: null,
      },
      { status: 200 }
    );
  },
  { guards: [] }
);

export const POST = apiErrorHandler(
  async (req) => {
    const body = await req.json();
    const values = productCategoryFormSchema.parse(body);

    const result = await service.createCategory(values);

    return NextResponse.json(result, { status: 201 });
  },
  { guards: [requiredSession] }
);
