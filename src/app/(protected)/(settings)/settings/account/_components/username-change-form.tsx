'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

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

import { ConfirmationDialog } from '@/components/custom/confirmation-dialog';
import {
  ResultDialog,
  ResultDialogProps,
} from '@/components/custom/result-dialog';
import { useUpdateUsername } from '@/feature/auth/mutations/user.mutation';
import {
  usernameUpdateSchema,
  type UsernameUpdateSchemaValues,
} from '@/feature/auth/schema/account.schema';
import { useConfirmationDialog } from '@/hooks/user-confirmation-dialog';
import React from 'react';

export default function AccountUsernameForm() {
  const updateUsername = useUpdateUsername();
  const confirmation = useConfirmationDialog();

  // const [resultDialog, setResultDialog] = React.useState<
  //   Omit<ResultDialogProps, 'onOpenChange'>
  // >({
  //   open: false,
  //   variant: 'idle',
  //   title: '',
  //   description: '',
  //   closeText: '',
  // });

  const form = useForm<UsernameUpdateSchemaValues>({
    resolver: zodResolver(usernameUpdateSchema),
    defaultValues: {
      username: '',
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  async function onSubmit(values: UsernameUpdateSchemaValues) {
    // setResultDialog({
    //   open: true,
    //   variant: 'loading',
    //   title: 'Updating your username...',
    // });

    // const { error } = await updateUsername.mutateAsync(values);

    // if (error) {
    //   setResultDialog({
    //     open: true,
    //     variant: 'error',
    //     title: 'An error has occurred while trying to update your username',
    //     description: `Details: ${error.message}`,
    //     closeText: 'Close',
    //   });

    //   return;
    // }

    // setResultDialog({
    //   open: true,
    //   variant: 'success',
    //   title: 'Username updated!',
    //   description: 'Your username has been successfully updated.',
    // });
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
          <form
            id="username-change-form"
            onSubmit={(e) => {
              e.preventDefault();

              form.handleSubmit((values) => {
                confirmation.show({
                  title: 'Update username?',
                  description: 'Are you sure you want to update your username?.',
                  confirmLabel: 'Save',
                  confirmVariant: 'default',
                  onConfirm: () => onSubmit(values),
                });
              })();
            }}>
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
              disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              Update Username
            </Button>
          </Field>
        </CardFooter>
      </Card>
      {/* <ResultDialog
        onOpenChange={(open) => setResultDialog({ ...resultDialog, open })}
        {...resultDialog}
      /> */}
      <ConfirmationDialog
        {...confirmation.dialog}
        open={confirmation.dialog.open}
        loading={confirmation.dialog.loading}
        onOpenChange={(open) =>
          confirmation.setDialog({ ...confirmation.dialog, open })
        }
        onConfirm={confirmation.confirm}
      />
    </>
  );
}
