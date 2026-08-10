'use client';

import { Folder, Pencil, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { Spinner } from '@/components/ui/spinner';
import { useProducts } from '@/feature/products/hooks/use-products';
import { useDialog } from '@/hooks/use-dialog';
import {
  ProductCategoryDialog,
  type ProductCategoryDialogOptions,
} from './product-category-dialog';

export default function ProductCategoryList() {
  const { categoriesWithGroupsModifiers } = useProducts();
  const categoryDialog = useDialog<ProductCategoryDialogOptions>();

  const handleCategoryEdit = (
    item: NonNullable<typeof categoriesWithGroupsModifiers.data>[number]
  ) => {
    categoryDialog.show({
      title: 'Edit Category',
      description: 'Create new product category for you product listings.',
      confirmLabel: 'Save',
      data: item,
    });
  };

  if (categoriesWithGroupsModifiers.isPending) {
    return <Spinner />;
  }

  return (
    <div className="space-y-3">
      {categoriesWithGroupsModifiers.data?.map((item) => (
        <Item key={String(item.id)} variant="muted" className="bg">
          <ItemMedia variant="icon">
            <Tag />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{item.name}</ItemTitle>
            <ItemDescription>
              {item.description ? item.description : 'No category description'}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <span className="flex items-center gap-2 text-muted-foreground text-xs">
              <Folder size={10} />
              Products {item.modifierGroups.length}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleCategoryEdit(item)}
            >
              <Pencil />
            </Button>
          </ItemActions>
        </Item>
      ))}

      {categoryDialog.dialog?.open && (
        <ProductCategoryDialog
          onOpenChange={(open) => {
            categoryDialog.setDialog((prev) =>
              prev ? { ...prev, open } : prev
            );
          }}
          {...categoryDialog.dialog}
        />
      )}
    </div>
  );
}
