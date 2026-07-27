"use client";

import { CheckCircle2, Info, Loader2, XCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

type ResultDialogVariant = "idle" | "loading" | "success" | "error";

export type ResultDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: ResultDialogVariant;
  title: string;
  description?: React.ReactNode;
  closeText?: string;
};

export function ResultDialog({
  open,
  onOpenChange,
  variant,
  title,
  description,
  closeText = "Close",
}: ResultDialogProps) {
  const isLoading = variant === "loading";

  const icon = {
    idle: <Info className="size-8 animate-spin" />,
    loading: <Loader2 className="size-8 animate-spin" />,
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
      <DialogContent>
        <DialogHeader className="items-center space-y-4 text-center">
          {icon}

          <DialogTitle>{title}</DialogTitle>

          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {!isLoading && (
          <Button onClick={() => onOpenChange(false)}>{closeText}</Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
