import { NextResponse } from 'next/server';
import { updateProductCategorySchema } from '@/feature/products/schema/product-category.schema';
import { ProductCategoryService } from '@/feature/products/service/product-category.service';
import { apiErrorHandler, requiredSession } from '@/lib/api-handler';

const service = new ProductCategoryService();

type Context = RouteContext<'/api/products/categories/[id]'>;

export type GetProductCategoryByIdApiResponse = Awaited<
  ReturnType<ProductCategoryService['getCategoryById']>
>;

export type UpdateProductCategoryApiResponse = Awaited<
  ReturnType<ProductCategoryService['updateCategory']>
>;

export const GET = apiErrorHandler<Context>(
  async (_req, context) => {
    const { id } = await context.params;

    const result = await service.getCategoryById(id);

    return NextResponse.json(result, { status: 201 });
  },
  { guards: [] }
);

export const PATCH = apiErrorHandler<Context>(
  async (req, context) => {
    const { id } = await context.params;
    const body = await req.json();
    const values = updateProductCategorySchema.parse({ ...body, id });

    const result = await service.updateCategory(values);

    return NextResponse.json(result, { status: 200 });
  },
  { guards: [requiredSession] }
);
