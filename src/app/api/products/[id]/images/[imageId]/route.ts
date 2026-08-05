import { NextResponse } from 'next/server';
import { ProductImageRepository } from '@/feature/products/repository/product-image.repository';
import { ProductImageService } from '@/feature/products/service/product-image.service';
import { apiErrorHandler, requiredSession } from '@/lib/api-handler';

const repository = new ProductImageRepository();
const service = new ProductImageService(repository);

type Context = RouteContext<'/api/products/[id]/images/[imageId]'>;

export type ProductImageApiResponse = Awaited<
  ReturnType<ProductImageService['getImage']>
>;

export const GET = apiErrorHandler<Context>(async (_req, context) => {
  const { id, imageId } = await context.params;

  const result = await service.getImage(id, imageId);

  return NextResponse.json(result, { status: 200 });
});

export type DeleteProductImageApiResponse = Awaited<
  ReturnType<ProductImageService['removeImage']>
>;

export const DELETE = apiErrorHandler<Context>(
  async (_req, context) => {
    const { id, imageId } = await context.params;

    const result = await service.removeImage(id, imageId);

    return NextResponse.json(result, { status: 200 });
  },
  { guards: [requiredSession] }
);
