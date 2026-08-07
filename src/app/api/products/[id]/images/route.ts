import { NextResponse } from 'next/server';
import z from 'zod';
import { addProductImageSchema } from '@/feature/products/schema/product-image.schema';
import { ProductImageService } from '@/feature/products/service/product-image.service';
import { apiErrorHandler, requiredSession } from '@/lib/api-handler';

const service = new ProductImageService();

type Context = RouteContext<'/api/products/[id]/images'>;

export type AddProductImagesApiResponse = Awaited<
  ReturnType<ProductImageService['addImages']>
>;

// multipart/form-data: a "data" field carries a JSON array of {sortOrder, altText}
// (no file), and repeated "images" fields carry the actual File objects in the
// same order, so they can be zipped back together before validation.
export const POST = apiErrorHandler<Context>(
  async (req, context) => {
    const { id } = await context.params;
    const formData = await req.formData();

    const metadata = JSON.parse(String(formData.get('data') ?? '[]'));
    const files = formData.getAll('images');

    const images = z.array(addProductImageSchema).parse(
      metadata.map((image: Record<string, unknown>, index: number) => ({
        ...image,
        file: files[index],
      }))
    );

    const result = await service.addImages(id, images);

    return NextResponse.json(result, { status: 201 });
  },
  { guards: [requiredSession] }
);
