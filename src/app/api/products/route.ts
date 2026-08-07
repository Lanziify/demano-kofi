import { NextResponse } from 'next/server';
import { createProductSchema } from '@/feature/products/schema/product.schema';
import { ProductService } from '@/feature/products/service/product.service';
import { apiErrorHandler, requiredSession } from '@/lib/api-handler';

const service = new ProductService();

export type CreateProductApiResponse = Awaited<
  ReturnType<ProductService['createProduct']>
>;

// multipart/form-data: a "data" field carries the JSON payload (name, variants,
// optional inline category, and each image's sortOrder/altText without the file),
// and repeated "images" fields carry the actual File objects in the same order as
// payload.images, so they can be zipped back together before validation.
export const POST = apiErrorHandler(
  async (req) => {
    const formData = await req.formData();

    const payload = JSON.parse(String(formData.get('data') ?? '{}'));
    const files = formData.getAll('images');

    const images = (payload.images ?? []).map(
      (image: Record<string, unknown>, index: number) => ({
        ...image,
        file: files[index],
      })
    );

    const values = createProductSchema.parse({ ...payload, images });

    const result = await service.createProduct(values);

    return NextResponse.json(result, { status: 201 });
  },
  { guards: [requiredSession] }
);
