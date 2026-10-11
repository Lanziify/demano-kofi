import { NextResponse } from 'next/server';
import { apiErrorHandler, requiredSession } from '@/core/http/api-handler';
import { categoryFormSchema } from '@/feature/products';
import { CategoryService } from '@/feature/products/server';

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
    const values = categoryFormSchema.parse({ ...body, id });

    const result = await service.updateCategory(values);

    return NextResponse.json(result, { status: 200 });
  },
  { guards: [requiredSession] }
);
