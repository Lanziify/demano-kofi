import { NextResponse } from 'next/server';
import type { ApiSuccessResponse } from '@/core/http/api.types';
import { apiErrorHandler, requiredSession } from '@/core/http/api-handler';
import { type Product, productFormSchema } from '@/feature/products';
import { ProductService } from '@/feature/products/server';

const service = new ProductService();

type Context = RouteContext<'/api/products/[id]'>;

export const PATCH = apiErrorHandler<Context>(
  async (req, context) => {
    const { id } = await context.params;

    const formData = await req.formData();

    const payload = JSON.parse(String(formData.get('data') ?? '{}'));
    const files = formData.getAll('images');

    let fileIndex = 0;
    const images = (payload.images ?? []).map((image: Record<string, unknown>) => {
      if (image.mediaId) {
        return image;
      }

      return { ...image, file: files[fileIndex++] };
    });

    const parsedValues = productFormSchema.parse({ ...payload, id, images });

    const result = await service.updateProduct(parsedValues);

    return NextResponse.json<ApiSuccessResponse<Product>>(
      {
        success: true,
        data: result,
        error: null,
      },
      { status: 200 }
    );
  },
  { guards: [requiredSession] }
);
