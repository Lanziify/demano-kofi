import { NextResponse } from 'next/server';
import type { ApiSuccessResponse } from '@/core/http/api.types';
import { apiErrorHandler, requiredSession } from '@/core/http/api-handler';
import { type Category, categoryFormSchema } from '@/feature/products';
import { CategoryService } from '@/feature/products/server';

const service = new CategoryService();

export const GET = apiErrorHandler(
  async () => {
    const result = await service.getCategories();

    return NextResponse.json<ApiSuccessResponse<Category[]>>(
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
    const values = categoryFormSchema.parse(body);

    const result = await service.createCategory(values);

    return NextResponse.json(result, { status: 201 });
  },
  { guards: [requiredSession] }
);
