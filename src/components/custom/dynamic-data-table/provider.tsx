'use client';

import type {
  ColumnDef,
  ColumnFiltersState,
  Table,
  VisibilityState,
} from '@tanstack/react-table';
import React from 'react';
import useDynamicTable from '@/hooks/use-dynamic-table';

interface DynamicTableContextType<T> {
  table: Table<T>;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  setColumns: React.Dispatch<React.SetStateAction<ColumnDef<T>[]>>;
  setDefaultColumn: React.Dispatch<
    React.SetStateAction<ColumnDef<T> | undefined>
  >;
  globalFilter: string;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
}

export const DynamicTableContext =
  React.createContext<DynamicTableContextType<any> | null>(null);

export function useDynamicTableContext<T>() {
  const ctx = React.useContext(DynamicTableContext);

  if (!ctx) {
    throw new Error('Cannot use this context outside its wrapper');
  }

  return ctx as DynamicTableContextType<T>;
}

interface DynamicTableProviderProps<T> {
  children: React.ReactNode;

  initialData: T[];

  initialColumns: ColumnDef<T>[];

  defaultColumn?: ColumnDef<T>;
}

export function DynamicTableProvider<T>({
  children,
  initialData,
  initialColumns,
  defaultColumn,
}: DynamicTableProviderProps<T>) {
  const value = useDynamicTable<T>();

  React.useEffect(() => {
    value.setData(initialData);
  }, [initialData]);

  React.useEffect(() => {
    value.setColumns(initialColumns);
  }, [initialColumns]);

  React.useEffect(() => {
    value.setDefaultColumn(defaultColumn);
  }, [defaultColumn]);

  return (
    <DynamicTableContext.Provider value={value as DynamicTableContextType<any>}>
      {children}
    </DynamicTableContext.Provider>
  );
}
