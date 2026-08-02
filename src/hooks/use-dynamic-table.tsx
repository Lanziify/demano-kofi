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

export default function useDynamicTable<T>() {
  const [data, setData] = React.useState<T[]>([]);
  const [defaultColumn, setDefaultColumn] = React.useState<ColumnDef<T>>();
  const [columns, setColumns] = React.useState<ColumnDef<T>[]>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [columnFilters, setColumnFilter] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

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

    setData,
    setColumns,
    setDefaultColumn,
  };
}
