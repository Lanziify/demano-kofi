import { NextResponse } from 'next/server';
import { ProductVariantRepository } from '@/feature/products/repository/product-variant.repository';
import { productVariantSchema } from '@/feature/products/schema/schema';
import { ProductVariantService } from '@/feature/products/service/product-variant.service';
import { apiErrorHandler, requiredSession } from '@/lib/api-handler';

const repository = new ProductVariantRepository();
const service = new ProductVariantService(repository);

type Context = RouteContext<'/api/products/[id]/variants/[variantId]'>;

export type ProductVariantApiResponse = Awaited<
  ReturnType<ProductVariantService['getVariant']>
>;

export const GET = apiErrorHandler<Context>(async (_req, context) => {
  const { id, variantId } = await context.params;

  const result = await service.getVariant(id, variantId);

  return NextResponse.json(result, { status: 200 });
});

export type UpdateProductVariantApiResponse = Awaited<
  ReturnType<ProductVariantService['updateVariant']>
>;

export const PATCH = apiErrorHandler<Context>(
  async (req, context) => {
    const { id, variantId } = await context.params;
    const body = await req.json();
    const values = productVariantSchema.parse({ ...body, productId: id });

    const result = await service.updateVariant(id, variantId, values);

    return NextResponse.json(result, { status: 200 });
  },
  { guards: [requiredSession] }
);

export type DeleteProductVariantApiResponse = Awaited<
  ReturnType<ProductVariantService['removeVariant']>
>;

export const DELETE = apiErrorHandler<Context>(
  async (_req, context) => {
    const { id, variantId } = await context.params;

    const result = await service.removeVariant(id, variantId);

    return NextResponse.json(result, { status: 200 });
  },
  { guards: [requiredSession] }
);
