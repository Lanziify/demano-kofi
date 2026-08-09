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

export default function ProductCategoryList() {
  const { categoriesWithGroupsModifiers } = useProducts();

  if (categoriesWithGroupsModifiers.isPending) {
    return <Spinner />;
  }

  console.log(categoriesWithGroupsModifiers.data);

  return (
    <div className="space-y-3">
      {categoriesWithGroupsModifiers.data?.map((item, index) => (
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
            <Button variant="ghost" size="icon-sm">
              <Pencil />
            </Button>
          </ItemActions>
        </Item>
      ))}
    </div>
  );
}
