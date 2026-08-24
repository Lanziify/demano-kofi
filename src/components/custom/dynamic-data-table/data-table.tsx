'use client';

import { flexRender, type Table as TanStackTable } from '@tanstack/react-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DataTableProps<T> {
  table: TanStackTable<T>;
  loading?: boolean;
}

// tanstack/react-table defaults maxSize to Number.MAX_SAFE_INTEGER when a
// column doesn't set one explicitly, so it can't be used as a CSS value.
const DEFAULT_MAX_SIZE = Number.MAX_SAFE_INTEGER;

const SKELETON_ROW_COUNT = 5;

export const DataTable = <T,>({ table, loading }: DataTableProps<T>) => {
  return (
    <div className="w-full">
      <div className="w-full overflow-auto rounded-md border">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{
                      width: header.column.columnDef.size,
                      maxWidth:
                        header.column.columnDef.maxSize === DEFAULT_MAX_SIZE
                          ? undefined
                          : header.column.columnDef.maxSize,
                    }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIndex) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder rows with no identity
                <TableRow key={`skeleton-row-${rowIndex}`}>
                  {table.getVisibleLeafColumns().map((column) => (
                    <TableCell
                      key={column.id}
                      style={{
                        width: column.columnDef.size,
                        maxWidth: column.columnDef.maxSize === DEFAULT_MAX_SIZE ? undefined : column.columnDef.maxSize,
                      }}
                    >
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: cell.column.columnDef.size,
                        maxWidth:
                          cell.column.columnDef.maxSize === DEFAULT_MAX_SIZE
                            ? undefined
                            : cell.column.columnDef.maxSize,
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-24 text-center">
                  There are no data to display.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
