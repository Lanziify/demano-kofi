import { NextResponse } from 'next/server';
import { categoryFormWithModifierGroupsSchema } from '@/feature/products/schema/category.schema';
import { CategoryService } from '@/feature/products/service/category.service';
import { apiErrorHandler, requiredSession } from '@/lib/api-handler';

const service = new CategoryService();

type Context = RouteContext<'/api/products/categories/[id]'>;

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
    const values = categoryFormWithModifierGroupsSchema.parse({ ...body, id });

    const result = await service.updateCategory(values);

    return NextResponse.json(result, { status: 200 });
  },
  { guards: [requiredSession] }
);
