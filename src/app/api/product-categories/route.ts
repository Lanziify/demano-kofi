import { NextResponse } from 'next/server';
import { productCategoryQuerySchema } from '@/feature/products/schema/product-category.schema';
import { ProductCategoryService } from '@/feature/products/service/product-category.service';
import { apiErrorHandler } from '@/lib/api-handler';

const service = new ProductCategoryService();

// export type CategoriesApiResponse = Awaited<
//   ReturnType<ProductCategoryService['getCategories']>
// >;
// export type CategoriesWithGroupsApiResponse = Awaited<
//   ReturnType<ProductCategoryService['getCategoriesWithGroups']>
// >;
// export type CategoriesWithGroupsModifiersApiResponse = Awaited<
//   ReturnType<ProductCategoryService['getCategoriesWithGroupsModifiers']>
// >;

export const GET = apiErrorHandler(
  async (req) => {
    const searchParams = req.nextUrl.searchParams;

    const values: Record<string, unknown> = {};

    searchParams.forEach((value, key) => {
      values[key] = value;
    });

    const { data: parsedValues } = productCategoryQuerySchema.safeParse(values);

    if (parsedValues?.include) {
      switch (parsedValues.include) {
        case 'groups': {
          const result = await service.getCategoriesWithGroups(
            parsedValues?.id
          );
          return NextResponse.json(result, { status: 200 });
        }
        case 'groupsModifiers': {
          const result = await service.getCategoriesWithGroupsModifiers(
            parsedValues?.id
          );
          return NextResponse.json(result, { status: 200 });
        }
      }
    }

    const result = await service.getCategories();
    return NextResponse.json(result, { status: 200 });
  },
  { guards: [] }
);
