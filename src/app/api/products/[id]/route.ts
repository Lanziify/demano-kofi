import { NextResponse } from 'next/server';
import { productFormSchema } from '@/feature/products/schema/product.schema';
import { ProductService } from '@/feature/products/service/product.service';
import type { Product } from '@/feature/products/types/types';
import { apiErrorHandler, requiredSession } from '@/lib/api-handler';
import type { ApiSuccessResponse } from '@/types/api';

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
