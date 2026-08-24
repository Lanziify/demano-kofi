import { NextResponse } from 'next/server';
import { productFormSchema } from '@/feature/products/schema/product.schema';
import { ProductService } from '@/feature/products/service/product.service';
import type { Product, ProductEmbedded } from '@/feature/products/types/types';
import { apiErrorHandler, requiredSession } from '@/lib/api-handler';
import type { ApiSuccessResponse } from '@/types/api';

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
