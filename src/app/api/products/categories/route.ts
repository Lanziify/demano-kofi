import { NextResponse } from 'next/server';
import z from 'zod';
import { ProductCategoryRepository } from '@/feature/products/repository/product-category.repository';
import { productCategorySchema } from '@/feature/products/schema/schema';
import { ProductCategoryService } from '@/feature/products/service/product-category.service';
import { apiErrorHandler } from '@/lib/api-handler';

const repository = new ProductCategoryRepository();
const service = new ProductCategoryService(repository);

const listCategoriesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

export type ProductCategoriesApiResponse = Awaited<
  ReturnType<ProductCategoryService['getCategories']>
>;

export const GET = apiErrorHandler(async (req) => {
  const { searchParams } = new URL(req.url);

  const { page, pageSize } = listCategoriesQuerySchema.parse(
    Object.fromEntries(searchParams)
  );

  const result = await service.getCategories({ page, pageSize });

  return NextResponse.json(result, { status: 200 });
});

export type CreateProductCategoryApiResponse = Awaited<
  ReturnType<ProductCategoryService['createCategory']>
>;

export const POST = apiErrorHandler(
  async (req) => {
    const body = await req.json();
    const values = productCategorySchema.parse(body);

    const result = await service.createCategory(values);

    return NextResponse.json(result, { status: 201 });
  },
  { guards: [] }
);
