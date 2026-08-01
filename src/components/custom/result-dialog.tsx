'use client';

import { CheckCircle2, XCircle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Spinner } from '../ui/spinner';

type ResultDialogVariant = 'loading' | 'success' | 'error';

export type ResultDialogOptions = {
  title?: string;
  description?: React.ReactNode;
  variant: ResultDialogVariant;
  closeText?: string;
};

export type ResultDialogProps = ResultDialogOptions & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ResultDialog({
  open,
  onOpenChange,
  variant,
  title,
  description,
  closeText = 'Close',
}: ResultDialogProps) {
  const isLoading = variant === 'loading';

  const icon = {
    loading: <Spinner className="size-8" />,
    success: <CheckCircle2 className="size-8" />,
    error: <XCircle className="size-8" />,
  }[variant];

  function handleOpenChange(value: boolean) {
    // prevent closing while loading
    if (isLoading && !value) {
      return;
    }

    onOpenChange(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={!isLoading}>
        <DialogHeader className="items-center space-y-4 text-center">
          {icon}

          <DialogTitle>{title}</DialogTitle>

          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {!isLoading && (
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>{closeText}</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
