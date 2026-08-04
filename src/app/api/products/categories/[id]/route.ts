import { NextResponse } from 'next/server';
import { ProductCategoryRepository } from '@/feature/products/repository/product-category.repository';
import { productCategorySchema } from '@/feature/products/schema/schema';
import { ProductCategoryService } from '@/feature/products/service/product-category.service';
import { apiErrorHandler } from '@/lib/api-handler';

const repository = new ProductCategoryRepository();
const service = new ProductCategoryService(repository);

export type ProductCategoryApiResponse = Awaited<
  ReturnType<ProductCategoryService['getCategory']>
>;

type Context = RouteContext<'/api/products/categories/[id]'>;

export const GET = apiErrorHandler<Context>(async (_req, context) => {
  const { id } = await context.params;

  const result = await service.getCategory(id);

  return NextResponse.json(result, { status: 200 });
});

export type UpdateProductCategoryApiResponse = Awaited<
  ReturnType<ProductCategoryService['updateCategory']>
>;

export const PATCH = apiErrorHandler<Context>(
  async (req, context) => {
    const { id } = await context.params;
    const body = await req.json();
    const values = productCategorySchema.parse(body);

    const result = await service.updateCategory(id, values);

    return NextResponse.json(result, { status: 200 });
  },
  { guards: [] }
);

export type DeleteProductCategoryApiResponse = Awaited<
  ReturnType<ProductCategoryService['deleteCategory']>
>;

export const DELETE = apiErrorHandler<Context>(
  async (_req, context) => {
    const { id } = await context.params;

    const result = await service.deleteCategory(id);

    return NextResponse.json(result, { status: 200 });
  },
  { guards: [] }
);
