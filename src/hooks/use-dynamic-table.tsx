'use client';

import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import React from 'react';

interface UseDynamicTableOptions<T> {
  data: T[];
  columns: ColumnDef<T>[];
  defaultColumn?: ColumnDef<T>;
}

export default function useDynamicTable<T>({ data, columns, defaultColumn }: UseDynamicTableOptions<T>) {
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [columnFilters, setColumnFilter] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable<T>({
    data,
    columns,
    defaultColumn,

    getCoreRowModel: getCoreRowModel(),

    getFilteredRowModel: getFilteredRowModel(),

    getPaginationRowModel: getPaginationRowModel(),

    onPaginationChange: setPagination,

    onGlobalFilterChange: setGlobalFilter,

    onColumnFiltersChange: setColumnFilter,

    onColumnVisibilityChange: setColumnVisibility,

    state: {
      pagination,
      globalFilter,
      columnFilters,
      columnVisibility,
    },
  });

  return {
    table,
    pagination,
    globalFilter,
    columnFilters,
    columnVisibility,
  };
}
