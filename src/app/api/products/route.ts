import { NextResponse } from 'next/server';
import z from 'zod';
import { ProductRepository } from '@/feature/products/repository/product.repository';
import { productSchema } from '@/feature/products/schema/schema';
import { ProductService } from '@/feature/products/service/product.service';
import { apiErrorHandler, requiredSession } from '@/lib/api-handler';

const repository = new ProductRepository();
const service = new ProductService(repository);

const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

export type ProductsApiResponse = Awaited<
  ReturnType<ProductService['getProducts']>
>;

export const GET = apiErrorHandler(async (req) => {
  const { searchParams } = new URL(req.url);

  const { page, pageSize } = listProductsQuerySchema.parse(
    Object.fromEntries(searchParams)
  );

  const result = await service.getProducts({ page, pageSize });

  return NextResponse.json(result, { status: 200 });
});

export type CreateProductApiResponse = Awaited<
  ReturnType<ProductService['createProduct']>
>;

export const POST = apiErrorHandler(
  async (req) => {
    const body = await req.json();
    const values = productSchema.parse(body);

    const result = await service.createProduct(values);

    return NextResponse.json(result, { status: 201 });
  },
  { guards: [requiredSession] }
);
