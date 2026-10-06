import { NextResponse } from 'next/server';
import { categoryFormSchema } from '@/feature/products/schema/category.schema';
import { CategoryService } from '@/feature/products/service/category.service';
import type { Category } from '@/feature/products/types/types';
import { apiErrorHandler, requiredSession } from '@/lib/api-handler';
import type { ApiSuccessResponse } from '@/types/api';

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
