import { NextResponse } from 'next/server';
import { ProductVariantRepository } from '@/feature/products/repository/product-variant.repository';
import { productVariantSchema } from '@/feature/products/schema/schema';
import { ProductVariantService } from '@/feature/products/service/product-variant.service';
import { apiErrorHandler, requiredSession } from '@/lib/api-handler';

const repository = new ProductVariantRepository();
const service = new ProductVariantService(repository);

type Context = RouteContext<'/api/products/[id]/variants'>;

export type ProductVariantsApiResponse = Awaited<
  ReturnType<ProductVariantService['getVariants']>
>;

export const GET = apiErrorHandler<Context>(async (_req, context) => {
  const { id } = await context.params;

  const result = await service.getVariants(id);

  return NextResponse.json(result, { status: 200 });
});

export type CreateProductVariantApiResponse = Awaited<
  ReturnType<ProductVariantService['addVariant']>
>;

export const POST = apiErrorHandler<Context>(
  async (req, context) => {
    const { id } = await context.params;
    const body = await req.json();
    const values = productVariantSchema.parse({ ...body, productId: id });

    const result = await service.addVariant(values);

    return NextResponse.json(result, { status: 201 });
  },
  { guards: [requiredSession] }
);
