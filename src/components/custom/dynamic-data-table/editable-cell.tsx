"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { CellContext } from "@tanstack/react-table";

export default function EditableCell<TData, TValue>({
  getValue,
  row,
  column,
  table,
}: CellContext<TData, TValue>) {
  const initialValue = getValue();
  const [value, setValue] = React.useState(initialValue);

  //   const onBlur = () => {
  //     table.options.meta?.updateData(row.index, column.id, value);
  //   };

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <Input
      value={value as string}
      onChange={(e) => setValue(e.target.value as TValue)}
      //   onBlur={onBlur}
    />
  );
}
