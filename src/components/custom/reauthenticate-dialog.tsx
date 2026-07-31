'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  reauthenticateSchema,
  ReauthenticateSchemaValues,
} from '@/feature/auth/schema/auth.schema';
import { Button } from '../ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { Spinner } from '../ui/spinner';

interface CreateCampusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (password: string) => Promise<void>;
}

export function ReauthenticateDialog({
  open,
  onOpenChange,
  onConfirm,
}: CreateCampusDialogProps) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<ReauthenticateSchemaValues>({
    resolver: zodResolver(reauthenticateSchema),
    defaultValues: {
      password: '',
    },
  });

  const onSubmit = async ({ password }: ReauthenticateSchemaValues) => {
    await onConfirm(password);

    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Confirm it's you</DialogTitle>

          <DialogDescription>
            To help keep your account secure, please enter your password to
            continue.
          </DialogDescription>
        </DialogHeader>

        <form id="reauthenticate-form" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Enter your password"
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <Field orientation="horizontal">
            <Button
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={isSubmitting}>
              Cancel
            </Button>

            <Button
              type="submit"
              form="reauthenticate-form"
              disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              Confirm
            </Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
