import { NextResponse } from 'next/server';
import { ProductCategoryModifierGroupRepository } from '@/feature/products/repository/product-category-modifier-group.repository';
import { ProductModifierGroupService } from '@/feature/products/service/product-modifier-group.service';
import { apiErrorHandler, requiredSession } from '@/lib/api-handler';

const repository = new ProductCategoryModifierGroupRepository();
const service = new ProductModifierGroupService(repository);

type Context =
  RouteContext<'/api/products/[id]/modifier-groups/[modifierGroupId]'>;

export type UnlinkProductModifierGroupApiResponse = Awaited<
  ReturnType<ProductModifierGroupService['unlinkModifierGroup']>
>;

export const DELETE = apiErrorHandler<Context>(
  async (_req, context) => {
    const { id, modifierGroupId } = await context.params;

    const result = await service.unlinkModifierGroup(id, modifierGroupId);

    return NextResponse.json(result, { status: 200 });
  },
  { guards: [requiredSession] }
);
