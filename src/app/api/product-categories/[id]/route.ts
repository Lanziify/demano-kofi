import { NextResponse } from 'next/server';
import { ProductCategoryService } from '@/feature/products/service/product-category.service';
import { apiErrorHandler } from '@/lib/api-handler';

const service = new ProductCategoryService();

type Context = RouteContext<'/api/product-categories/[id]'>;

export type GetProductCategoryByIdApiResponse = Awaited<
  ReturnType<ProductCategoryService['getCategoryById']>
>;

export const GET = apiErrorHandler<Context>(
  async (_req, context) => {
    const { id } = await context.params;

    const result = await service.getCategoryById(id);

    return NextResponse.json(result, { status: 201 });
  },
  { guards: [] }
);
