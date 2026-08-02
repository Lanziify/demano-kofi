'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import {
  ConfirmationDialog,
  type ConfirmationDialogOptions,
} from '@/components/custom/confirmation-dialog';
import {
  ResultDialog,
  type ResultDialogOptions,
} from '@/components/custom/result-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useUpdateUsername } from '@/feature/auth/mutations/user.mutation';
import {
  type UsernameUpdateSchemaValues,
  usernameUpdateSchema,
} from '@/feature/auth/schema/account.schema';
import { useDialog } from '@/hooks/use-dialog';

export default function AccountUsernameForm() {
  const updateUsername = useUpdateUsername();
  const confirmationDialog = useDialog<ConfirmationDialogOptions>();
  const resultDialog = useDialog<ResultDialogOptions>();

  const form = useForm<UsernameUpdateSchemaValues>({
    resolver: zodResolver(usernameUpdateSchema),
    defaultValues: {
      username: '',
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  async function onSubmit() {
    confirmationDialog.show({
      title: 'Update username?',
      description: 'Are you sure you want to update your username?.',
      confirmLabel: 'Save',
      confirmVariant: 'default',
    });
  }

  async function handleConfirmSubmit(values: UsernameUpdateSchemaValues) {
    resultDialog.setDialog(null);

    resultDialog.show({
      variant: 'loading',
      title: 'Updating',
      description: 'Updating username please wait...',
    });

    const { error } = await updateUsername.mutateAsync(values);

    if (error) {
      resultDialog.setDialog((prev) =>
        prev
          ? {
              ...prev,
              variant: 'error',
              title:
                'An error has occurred while trying to update your username',
              description: `Details: ${error.message}`,
            }
          : prev
      );

      return;
    }

    resultDialog.setDialog((prev) =>
      prev
        ? {
            ...prev,
            variant: 'success',
            title: 'Username updated!',
            description: 'Your username has been successfully updated.',
          }
        : prev
    );

    reset();
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Username</CardTitle>
          <CardDescription>
            Manage your public username used to identify your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form id="username-change-form" onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="username"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>New username</FieldLabel>
                    <Input {...field} placeholder="New-username" />

                    <FieldDescription>
                      Username identifies your account and is used for signing
                      in. Keep it unique and easy to remember.
                    </FieldDescription>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            <Button
              type="submit"
              form="username-change-form"
              disabled={isSubmitting}
            >
              {isSubmitting && <Spinner />}
              Update Username
            </Button>
          </Field>
        </CardFooter>
      </Card>

      {resultDialog.dialog && (
        <ResultDialog
          {...resultDialog.dialog}
          onOpenChange={(open) => {
            resultDialog.setDialog((prev) => (prev ? { ...prev, open } : prev));
          }}
        />
      )}

      {confirmationDialog.dialog && (
        <ConfirmationDialog
          {...confirmationDialog.dialog}
          onOpenChange={(open) => {
            confirmationDialog.setDialog((prev) =>
              prev ? { ...prev, open } : prev
            );
          }}
          onConfirm={() => {
            confirmationDialog.setDialog((prev) =>
              prev ? { ...prev, open: false } : prev
            );

            handleConfirmSubmit(form.getValues());
          }}
        />
      )}
    </>
  );
}
