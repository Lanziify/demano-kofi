'use client';

import React from 'react';
import type {
  ConfirmationDialogOptions,
  ConfirmationDialogProps,
} from '@/components/custom/confirmation-dialog';

type ConfirmationDialogState = Omit<ConfirmationDialogProps, 'onOpenChange'>;

export function useConfirmationDialog() {
  const [dialog, setDialog] = React.useState<ConfirmationDialogState>({
    open: false,
    loading: false,
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    confirmVariant: 'default',
    onConfirm: async () => {},
  });

  function show(options: ConfirmationDialogOptions) {
    setDialog({
      open: true,
      loading: false,
      ...options,
    });
  }

  function close() {
    setDialog((prev) => ({
      ...prev,
      open: false,
      loading: false,
    }));
  }

  async function confirm() {
    if (!dialog.onConfirm) return;

    setDialog((prev) => ({
      ...prev,
      loading: true,
    }));

    await dialog.onConfirm();

    setDialog((prev) => ({
      ...prev,
      open: false,
      loading: false,
    }));
  }

  return {
    dialog,
    setDialog,
    show,
    close,
    confirm,
  };
}
