import { NextResponse } from 'next/server';
import { ProductModifierRepository } from '@/feature/products/repository/product-modifier.repository';
import { productModifierSchema } from '@/feature/products/schema/schema';
import { ProductModifierService } from '@/feature/products/service/product-modifier.service';
import { apiErrorHandler, requiredSession } from '@/lib/api-handler';

const repository = new ProductModifierRepository();
const service = new ProductModifierService(repository);

type Context = RouteContext<'/api/modifier-groups/[id]/modifiers'>;

export type ProductModifiersApiResponse = Awaited<
  ReturnType<ProductModifierService['getModifiers']>
>;

export const GET = apiErrorHandler<Context>(async (_req, context) => {
  const { id } = await context.params;

  const result = await service.getModifiers(id);

  return NextResponse.json(result, { status: 200 });
});

export type CreateProductModifierApiResponse = Awaited<
  ReturnType<ProductModifierService['addModifier']>
>;

export const POST = apiErrorHandler<Context>(
  async (req, context) => {
    const { id } = await context.params;
    const body = await req.json();
    const values = productModifierSchema.parse({
      ...body,
      modifierGroupId: id,
    });

    const result = await service.addModifier(values);

    return NextResponse.json(result, { status: 201 });
  },
  { guards: [requiredSession] }
);
