import { NextResponse } from 'next/server';
import z from 'zod';
import { ProductModifierGroupRepository } from '@/feature/products/repository/product-modifier-group.repository';
import { modifierGroupSchema } from '@/feature/products/schema/schema';
import { ModifierGroupService } from '@/feature/products/service/modifier-group.service';
import { apiErrorHandler, requiredSession } from '@/lib/api-handler';

const repository = new ProductModifierGroupRepository();
const service = new ModifierGroupService(repository);

const listModifierGroupsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

export type ModifierGroupsApiResponse = Awaited<
  ReturnType<ModifierGroupService['getModifierGroups']>
>;

export const GET = apiErrorHandler(async (req) => {
  const { searchParams } = new URL(req.url);

  const { page, pageSize } = listModifierGroupsQuerySchema.parse(
    Object.fromEntries(searchParams)
  );

  const result = await service.getModifierGroups({ page, pageSize });

  return NextResponse.json(result, { status: 200 });
});

export type CreateModifierGroupApiResponse = Awaited<
  ReturnType<ModifierGroupService['createModifierGroup']>
>;

export const POST = apiErrorHandler(
  async (req) => {
    const body = await req.json();
    const values = modifierGroupSchema.parse(body);

    const result = await service.createModifierGroup(values);

    return NextResponse.json(result, { status: 201 });
  },
  { guards: [requiredSession] }
);
