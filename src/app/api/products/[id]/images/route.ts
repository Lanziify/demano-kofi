import { NextResponse } from 'next/server';
import { ProductImageRepository } from '@/feature/products/repository/product-image.repository';
import { productImageSchema } from '@/feature/products/schema/schema';
import { ProductImageService } from '@/feature/products/service/product-image.service';
import { apiErrorHandler, requiredSession } from '@/lib/api-handler';

const repository = new ProductImageRepository();
const service = new ProductImageService(repository);

type Context = RouteContext<'/api/products/[id]/images'>;

export type ProductImagesApiResponse = Awaited<
  ReturnType<ProductImageService['getImages']>
>;

export const GET = apiErrorHandler<Context>(async (_req, context) => {
  const { id } = await context.params;

  const result = await service.getImages(id);

  return NextResponse.json(result, { status: 200 });
});

export type CreateProductImageApiResponse = Awaited<
  ReturnType<ProductImageService['addImage']>
>;

export const POST = apiErrorHandler<Context>(
  async (req, context) => {
    const { id } = await context.params;
    const body = await req.json();
    const values = productImageSchema.parse({ ...body, productId: id });

    const result = await service.addImage(values);

    return NextResponse.json(result, { status: 201 });
  },
  { guards: [requiredSession] }
);
