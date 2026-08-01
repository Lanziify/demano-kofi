'use client';

import * as React from 'react';

type DialogBaseOptions = {
  title: string,
  description?: string,
  onConfirm?: () => void | Promise<void>;
} ;

type DialogBaseState<T> = {
  open: boolean;
  loading: boolean;
} & T;

export function useDialog<T extends object>() {
  const [dialog, setDialog] = React.useState<DialogBaseState<T> | null>(null);

  function show(options: T) {
    setDialog((prev) => ({
      ...prev,
      ...options,
      open: true,
      loading: false,
      onConfirm: () => {},
    }));
  }

  function close() {
    setDialog(null);
  }

  // async function confirm() {
  //   if (!dialog || !dialog?.onConfirm) return;

  //   setDialog((prev) =>
  //     prev
  //       ? {
  //           ...prev,
  //           loading: true,
  //         }
  //       : prev
  //   );

  //   try {
  //     await dialog.onConfirm();
  //     close();
  //   } finally {
  //     setDialog((prev) =>
  //       prev
  //         ? {
  //             ...prev,
  //             loading: false,
  //           }
  //         : prev
  //     );
  //   }
  // }

  return {
    dialog,
    show,
    close,
    // confirm,
    setDialog,
  };
}
