'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Ellipsis, ImageOff, Star } from 'lucide-react';
import Link from 'next/link';
import { DynamicTable, DynamicTableFilter, DynamicTablePagination } from '@/components/custom/dynamic-data-table';
import { DynamicTableProvider } from '@/components/custom/dynamic-data-table/provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { productQueries } from '@/feature/products/queries/products.queries';
import type { ProductEmbedded } from '@/feature/products/types/types';
import { formatDate, toDate } from '@/lib/date';
import { cn } from '@/lib/utils';

type ProductRow = ProductEmbedded[number];

type ColumnActions = {
  onEditProduct: (row: ProductRow) => void;
};

const getColumns = (actions?: ColumnActions): ColumnDef<ProductRow>[] => [
  {
    id: 'image',
    header: 'Image',
    size: 64,
    maxSize: 64,
    cell: ({ row }) => {
      const image = row.original.images[0];

      return (
        <Avatar size="lg" className="border-0 ring-0 after:border-none">
          {image && <AvatarImage className="rounded-md" src={image.url} alt={image.altText ?? row.original.name} />}
          <AvatarFallback className="rounded-md">
            <ImageOff size={16} />
          </AvatarFallback>
        </Avatar>
      );
    },
  },
  {
    accessorKey: 'name',
    header: 'Product',
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <p className="font-medium">{row.original.name}</p>
        {row.original.description && (
          <p className="line-clamp-1 text-muted-foreground text-xs">{row.original.description}</p>
        )}
      </div>
    ),
  },
  {
    id: 'category',
    header: 'Category',
    accessorFn: (row) => row.category?.name ?? '',
    cell: ({ getValue }) => {
      const name = getValue<string>();

      return name ? <Badge variant="outline">{name}</Badge> : <span className="text-muted-foreground">—</span>;
    },
  },
  {
    id: 'variants',
    header: 'Variants',
    accessorFn: (row) => row.variants.length,
    cell: ({ getValue }) => `${getValue<number>()} variant(s)`,
  },
  {
    accessorKey: 'isAvailable',
    header: 'Status',
    cell: ({ getValue }) => (
      <Badge variant={getValue<boolean>() ? 'secondary' : 'outline'}>
        {getValue<boolean>() ? 'Available' : 'Unavailable'}
      </Badge>
    ),
  },
  {
    accessorKey: 'isFeatured',
    header: 'Featured',
    cell: ({ getValue }) => (
      <Star
        className={cn('fill-yellow-400 text-yellow-400', { 'fill-gray-400 text-gray-500': !getValue<boolean>() })}
        size={16}
      />
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ getValue }) => formatDate(toDate(getValue<string | Date>())),
  },
  {
    accessorKey: 'action',
    size: 50,
    header: 'Action',
    cell: ({ row }) => {
      return (
        <div className="flex w-full items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Ellipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Product Manage</DropdownMenuLabel>
                  <DropdownMenuItem>View</DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/products/${row.original.id}/edit`}>Edit</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem>Archive / Deactivate</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Other Management</DropdownMenuLabel>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Manage</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem>Images</DropdownMenuItem>
                      <DropdownMenuItem>Variants</DropdownMenuItem>
                      <DropdownMenuItem>Modifiers</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export default function ProductList() {
  const { data, isPending } = useQuery(productQueries.products());

  return (
    <DynamicTableProvider<ProductRow> loading={isPending} initialData={data?.data} initialColumns={getColumns()}>
      <div className="space-y-4">
        <DynamicTableFilter />
        <DynamicTable />
        <DynamicTablePagination />
      </div>
    </DynamicTableProvider>
  );
}
