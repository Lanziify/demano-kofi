import '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    updateData: (
      rowIndex: number,
      columnId: keyof TData,
      value: TData[keyof TData]
    ) => void;
  }
}
