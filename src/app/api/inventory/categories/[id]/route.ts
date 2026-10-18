import { NextResponse } from 'next/server';
import { apiErrorHandler, requiredSession } from '@/core/http/api-handler';
import { inventoryCategoryFormSchema } from '@/feature/inventory';
import { InventoryCategoryService } from '@/feature/inventory/server';

const service = new InventoryCategoryService();

type Context = RouteContext<'/api/inventory/categories/[id]'>;

export const GET = apiErrorHandler<Context>(
  async (_req, context) => {
    const { id } = await context.params;

    const result = await service.getCategoryById(id);

    return NextResponse.json(result, { status: 201 });
  },
  { guards: [] }
);

export const PATCH = apiErrorHandler<Context>(
  async (req, context) => {
    const { id } = await context.params;
    const body = await req.json();
    const values = inventoryCategoryFormSchema.parse({ ...body, id });

    const result = await service.updateCategory(values);

    return NextResponse.json(result, { status: 200 });
  },
  // { guards: [requiredSession] }
);
