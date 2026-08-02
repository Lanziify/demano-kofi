import { Input } from '@/components/ui/input';
import { DataTable } from './data-table';
import DataTablePagination from './pagination';
import { useDynamicTableContext } from './provider';

export function DynamicTable<T>() {
  const { table } = useDynamicTableContext<T>();

  return <DataTable table={table} />;
}

export function DynamicTableFilter<T>() {
  const { table } = useDynamicTableContext<T>();

  return (
    <Input
      value={table.getState().globalFilter ?? ''}
      placeholder="Search"
      onChange={(e) => table.setGlobalFilter(e.target.value)}
    />
  );
}

export function DynamicTablePagination<T>() {
  const { table } = useDynamicTableContext<T>();
  return <DataTablePagination table={table} />;
}
