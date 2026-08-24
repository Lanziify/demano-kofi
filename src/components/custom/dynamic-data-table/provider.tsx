'use client';

import type { ColumnDef, ColumnFiltersState, Table, VisibilityState } from '@tanstack/react-table';
import React from 'react';
import useDynamicTable from '@/hooks/use-dynamic-table';

interface DynamicTableContextType<T> {
  table: Table<T>;
  loading: boolean;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  globalFilter: string;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
}

export const DynamicTableContext = React.createContext<DynamicTableContextType<any> | null>(null);

export function useDynamicTableContext<T>() {
  const ctx = React.useContext(DynamicTableContext);

  if (!ctx) {
    throw new Error('Cannot use this context outside its wrapper');
  }

  return ctx as DynamicTableContextType<T>;
}

interface DynamicTableProviderProps<T> {
  children: React.ReactNode;
  loading?: boolean;
  initialData: T[] | undefined;
  initialColumns: ColumnDef<T>[];
  defaultColumn?: ColumnDef<T>;
}

export function DynamicTableProvider<T>({
  children,
  loading,
  initialData,
  initialColumns,
  defaultColumn,
}: DynamicTableProviderProps<T>) {
  const isLoading = loading ?? initialData === undefined;

  const value = useDynamicTable<T>({
    data: initialData ?? [],
    columns: initialColumns,
    defaultColumn,
  });

  return (
    <DynamicTableContext.Provider value={{ ...value, loading: isLoading } as DynamicTableContextType<T>}>
      {children}
    </DynamicTableContext.Provider>
  );
}
