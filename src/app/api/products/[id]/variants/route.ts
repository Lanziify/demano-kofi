import { NextResponse } from 'next/server';
import { productVariantSchema } from '@/feature/products/schema/product-variant.schema';
import { ProductVariantService } from '@/feature/products/service/product-variant.service';
import { apiErrorHandler, requiredSession } from '@/lib/api-handler';

const service = new ProductVariantService();

type Context = RouteContext<'/api/products/[id]/variants'>;

export type AddProductVariantApiResponse = Awaited<
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
