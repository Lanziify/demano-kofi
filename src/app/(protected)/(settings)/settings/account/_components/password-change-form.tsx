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
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { Spinner } from '@/components/ui/spinner';

import {
  ResultDialog,
  ResultDialogProps,
} from '@/components/custom/result-dialog';
import { useChangePassword } from '@/feature/auth/mutations/user.mutation';
import {
  passwordUpdateSchema,
  type PasswordUpdateSchemaValues,
} from '@/feature/auth/schema/account.schema';
import React from 'react';

export default function AccountPasswordForm() {
  const changePassword = useChangePassword();

  const [resultDialog, setResultDialog] = React.useState<
    Omit<ResultDialogProps, 'onOpenChange'>
  >({
    open: false,
    variant: 'idle',
    title: '',
    description: '',
    closeText: '',
  });

  const form = useForm<PasswordUpdateSchemaValues>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  async function onSubmit(values: PasswordUpdateSchemaValues) {
    const passwordChangeResult = await changePassword.mutateAsync({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });

    if (!passwordChangeResult?.data && passwordChangeResult.error) {
      setResultDialog({
        open: true,
        variant: 'error',
        title: "Something wen't wrong",
        description: `Details: ${passwordChangeResult.error.message}`,
        closeText: 'Close',
      });
      return;
    }

    reset();

    setResultDialog({
      open: true,
      variant: 'success',
      title: 'Password Changed',
      description: 'Your password has been changed successfully.',
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password to keep your account secure.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form id="password-change-form" onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="currentPassword"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Current password
                    </FieldLabel>
                    <Input
                      {...field}
                      placeholder="Enter current password"
                      type="password"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="newPassword"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                    <Input
                      {...field}
                      placeholder="Enter new password"
                      type="password"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="confirmNewPassword"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Confirm password
                    </FieldLabel>
                    <Input
                      {...field}
                      placeholder="Confirm new password"
                      type="password"
                    />

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
              form="password-change-form"
              disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              Update Password
            </Button>
          </Field>
        </CardFooter>
      </Card>
      <ResultDialog
        onOpenChange={(open) => setResultDialog({ ...resultDialog, open })}
        {...resultDialog}
      />
    </>
  );
}
