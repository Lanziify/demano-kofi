'use client';

import * as React from 'react';

type DialogBaseState<T> = {
  open: boolean;
  loading: boolean;
} & T;

export function useDialog<T extends object>() {
  const [dialog, setDialog] = React.useState<DialogBaseState<T> | null>(null);

  function show(options: T) {
    setDialog({
      ...options,
      open: true,
      loading: false,
    });
  }

  function close() {
    setDialog(null);
  }

  return {
    dialog,
    show,
    close,
    setDialog,
  };
}