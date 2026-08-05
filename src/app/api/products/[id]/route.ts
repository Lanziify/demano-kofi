import { NextResponse } from 'next/server';
import { ProductRepository } from '@/feature/products/repository/product.repository';
import { productSchema } from '@/feature/products/schema/schema';
import { ProductService } from '@/feature/products/service/product.service';
import { apiErrorHandler, requiredSession } from '@/lib/api-handler';

const repository = new ProductRepository();
const service = new ProductService(repository);

type Context = RouteContext<'/api/products/[id]'>;

export type ProductApiResponse = Awaited<
  ReturnType<ProductService['getProduct']>
>;

export const GET = apiErrorHandler<Context>(async (_req, context) => {
  const { id } = await context.params;

  const result = await service.getProduct(id);

  return NextResponse.json(result, { status: 200 });
});

export type UpdateProductApiResponse = Awaited<
  ReturnType<ProductService['updateProduct']>
>;

export const PATCH = apiErrorHandler<Context>(
  async (req, context) => {
    const { id } = await context.params;
    const body = await req.json();
    const values = productSchema.parse(body);

    const result = await service.updateProduct(id, values);

    return NextResponse.json(result, { status: 200 });
  },
  { guards: [requiredSession] }
);

export type DeleteProductApiResponse = Awaited<
  ReturnType<ProductService['deleteProduct']>
>;

export const DELETE = apiErrorHandler<Context>(
  async (_req, context) => {
    const { id } = await context.params;

    const result = await service.deleteProduct(id);

    return NextResponse.json(result, { status: 200 });
  },
  { guards: [requiredSession] }
);
