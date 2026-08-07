import { NextResponse } from 'next/server';
import { createProductCategorySchema } from '@/feature/products/schema/product-category.schema';
import { ProductCategoryService } from '@/feature/products/service/product-category.service';
import { apiErrorHandler, requiredSession } from '@/lib/api-handler';

const service = new ProductCategoryService();

export type CreateProductCategoryApiResponse = Awaited<
  ReturnType<ProductCategoryService['createCategory']>
>;

export const POST = apiErrorHandler(
  async (req) => {
    const body = await req.json();
    const values = createProductCategorySchema.parse(body);

    const result = await service.createCategory(values);

    return NextResponse.json(result, { status: 201 });
  },
  { guards: [requiredSession] }
);
