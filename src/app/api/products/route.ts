import { NextResponse } from 'next/server';
import type { ApiSuccessResponse } from '@/core/http/api.types';
import { apiErrorHandler, requiredSession } from '@/core/http/api-handler';
import { type Product, type ProductEmbedded, productFormSchema } from '@/feature/products';
import { ProductService } from '@/feature/products/server';

const service = new ProductService();

export const GET = apiErrorHandler(
  async () => {
    const result = await service.getProducts();

    return NextResponse.json<ApiSuccessResponse<ProductEmbedded>>(
      {
        success: true,
        data: result,
        error: null,
      },
      { status: 200 }
    );
  },
  { guards: [] }
);

export const POST = apiErrorHandler(
  async (req) => {
    const formData = await req.formData();

    const payload = JSON.parse(String(formData.get('data') ?? '{}'));
    const files = formData.getAll('images');

    const images = (payload.images ?? []).map((image: Record<string, unknown>, index: number) => ({
      ...image,
      file: files[index],
    }));

    const parsedValues = productFormSchema.parse({ ...payload, images });

    const result = await service.createProduct(parsedValues);

    return NextResponse.json<ApiSuccessResponse<Product>>(
      {
        success: true,
        data: result,
        error: null,
      },
      { status: 201 }
    );
  },
  { guards: [requiredSession] }
);
