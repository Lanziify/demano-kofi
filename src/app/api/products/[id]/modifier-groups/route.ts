import { NextResponse } from 'next/server';
import { ProductCategoryModifierGroupRepository } from '@/feature/products/repository/product-category-modifier-group.repository';
import { productModifierGroupSchema } from '@/feature/products/schema/schema';
import { ProductModifierGroupService } from '@/feature/products/service/product-modifier-group.service';
import { apiErrorHandler, requiredSession } from '@/lib/api-handler';

const repository = new ProductCategoryModifierGroupRepository();
const service = new ProductModifierGroupService(repository);

type Context = RouteContext<'/api/products/[id]/modifier-groups'>;

export type ProductModifierGroupsApiResponse = Awaited<
  ReturnType<ProductModifierGroupService['getModifierGroups']>
>;

export const GET = apiErrorHandler<Context>(async (_req, context) => {
  const { id } = await context.params;

  const result = await service.getModifierGroups(id);

  return NextResponse.json(result, { status: 200 });
});

export type LinkProductModifierGroupApiResponse = Awaited<
  ReturnType<ProductModifierGroupService['linkModifierGroup']>
>;

export const POST = apiErrorHandler<Context>(
  async (req, context) => {
    const { id } = await context.params;
    const body = await req.json();
    const values = productModifierGroupSchema.parse({ ...body, productId: id });

    const result = await service.linkModifierGroup(values);

    return NextResponse.json(result, { status: 201 });
  },
  { guards: [requiredSession] }
);
