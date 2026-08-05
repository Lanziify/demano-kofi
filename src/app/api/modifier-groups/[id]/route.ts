import { NextResponse } from 'next/server';
import { ProductModifierGroupRepository } from '@/feature/products/repository/product-modifier-group.repository';
import { modifierGroupSchema } from '@/feature/products/schema/schema';
import { ModifierGroupService } from '@/feature/products/service/modifier-group.service';
import { apiErrorHandler, requiredSession } from '@/lib/api-handler';

const repository = new ProductModifierGroupRepository();
const service = new ModifierGroupService(repository);

type Context = RouteContext<'/api/modifier-groups/[id]'>;

export type ModifierGroupApiResponse = Awaited<
  ReturnType<ModifierGroupService['getModifierGroup']>
>;

export const GET = apiErrorHandler<Context>(async (_req, context) => {
  const { id } = await context.params;

  const result = await service.getModifierGroup(id);

  return NextResponse.json(result, { status: 200 });
});

export type UpdateModifierGroupApiResponse = Awaited<
  ReturnType<ModifierGroupService['updateModifierGroup']>
>;

export const PATCH = apiErrorHandler<Context>(
  async (req, context) => {
    const { id } = await context.params;
    const body = await req.json();
    const values = modifierGroupSchema.parse(body);

    const result = await service.updateModifierGroup(id, values);

    return NextResponse.json(result, { status: 200 });
  },
  { guards: [requiredSession] }
);

export type DeleteModifierGroupApiResponse = Awaited<
  ReturnType<ModifierGroupService['deleteModifierGroup']>
>;

export const DELETE = apiErrorHandler<Context>(
  async (_req, context) => {
    const { id } = await context.params;

    const result = await service.deleteModifierGroup(id);

    return NextResponse.json(result, { status: 200 });
  },
  { guards: [requiredSession] }
);
