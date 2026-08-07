import { NextResponse } from 'next/server';
import { ProductModifierGroupRepository } from '@/feature/products/repository/product-modifier-group.repository';
import { createProductModifierGroupSchema } from '@/feature/products/schema/product-modifier-group.schema';
import { ModifierGroupService } from '@/feature/products/service/modifier-group.service';
import { apiErrorHandler, requiredSession } from '@/lib/api-handler';

const service = new ModifierGroupService(new ProductModifierGroupRepository());

export type CreateModifierGroupApiResponse = Awaited<
  ReturnType<ModifierGroupService['createModifierGroup']>
>;

export const POST = apiErrorHandler(
  async (req) => {
    const body = await req.json();
    const values = createProductModifierGroupSchema.parse(body);

    const result = await service.createModifierGroup(values);

    return NextResponse.json(result, { status: 201 });
  },
  { guards: [requiredSession] }
);
