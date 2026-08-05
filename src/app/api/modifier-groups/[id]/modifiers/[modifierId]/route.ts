import { NextResponse } from 'next/server';
import { ProductModifierRepository } from '@/feature/products/repository/product-modifier.repository';
import { productModifierSchema } from '@/feature/products/schema/schema';
import { ProductModifierService } from '@/feature/products/service/product-modifier.service';
import { apiErrorHandler, requiredSession } from '@/lib/api-handler';

const repository = new ProductModifierRepository();
const service = new ProductModifierService(repository);

type Context = RouteContext<'/api/modifier-groups/[id]/modifiers/[modifierId]'>;

export type ProductModifierApiResponse = Awaited<
  ReturnType<ProductModifierService['getModifier']>
>;

export const GET = apiErrorHandler<Context>(async (_req, context) => {
  const { id, modifierId } = await context.params;

  const result = await service.getModifier(id, modifierId);

  return NextResponse.json(result, { status: 200 });
});

export type UpdateProductModifierApiResponse = Awaited<
  ReturnType<ProductModifierService['updateModifier']>
>;

export const PATCH = apiErrorHandler<Context>(
  async (req, context) => {
    const { id, modifierId } = await context.params;
    const body = await req.json();
    const values = productModifierSchema.parse({
      ...body,
      modifierGroupId: id,
    });

    const result = await service.updateModifier(id, modifierId, values);

    return NextResponse.json(result, { status: 200 });
  },
  { guards: [requiredSession] }
);

export type DeleteProductModifierApiResponse = Awaited<
  ReturnType<ProductModifierService['removeModifier']>
>;

export const DELETE = apiErrorHandler<Context>(
  async (_req, context) => {
    const { id, modifierId } = await context.params;

    const result = await service.removeModifier(id, modifierId);

    return NextResponse.json(result, { status: 200 });
  },
  { guards: [requiredSession] }
);
