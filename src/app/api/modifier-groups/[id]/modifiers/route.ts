import { NextResponse } from 'next/server';
import { ProductModifierRepository } from '@/feature/products/repository/product-modifier.repository';
import { createProductModifierSchema } from '@/feature/products/schema/product-modifier.schema';
import { ProductModifierService } from '@/feature/products/service/product-modifier.service';
import { apiErrorHandler, requiredSession } from '@/lib/api-handler';

const service = new ProductModifierService(new ProductModifierRepository());

type Context = RouteContext<'/api/modifier-groups/[id]/modifiers'>;

export type AddProductModifierApiResponse = Awaited<
  ReturnType<ProductModifierService['addModifier']>
>;

export const POST = apiErrorHandler<Context>(
  async (req, context) => {
    const { id } = await context.params;
    const body = await req.json();
    const values = createProductModifierSchema.parse(body);

    const result = await service.addModifier(id, values);

    return NextResponse.json(result, { status: 201 });
  },
  { guards: [requiredSession] }
);
