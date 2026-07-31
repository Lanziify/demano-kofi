'use client';

import {
  ResultDialog,
  ResultDialogProps,
} from '@/components/custom/result-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { resetPasswordAction } from '../actions/auth.actions';
import {
  PasswordWithConfirmationSchemaValues,
  passwordWithConfirmationSchema,
} from '../schema/shared.schema';

interface ResetPasswordFormProps extends React.ComponentProps<'div'> {
  token: string;
}

export function ResetPasswordForm({
  className,
  token,
  ...props
}: ResetPasswordFormProps) {
  const { theme } = useTheme();

  const [resultDialog, setResultDialog] = React.useState<
    Omit<ResultDialogProps, 'onOpenChange'>
  >({
    open: false,
    variant: 'idle',
    title: '',
    description: '',
    closeText: '',
  });

  const { control, handleSubmit, reset } =
    useForm<PasswordWithConfirmationSchemaValues>({
      resolver: zodResolver(passwordWithConfirmationSchema),
      defaultValues: {
        password: '',
        confirmPassword: '',
      },
    });

  async function onSubmit(values: PasswordWithConfirmationSchemaValues) {
    setResultDialog({
      open: true,
      variant: 'loading',
      title: 'Updating your password',
    });

    const { error } = await resetPasswordAction({
      newPassword: values.password,
      token,
    });

    if (error) {
      setResultDialog({
        open: true,
        variant: 'error',
        title: 'Something went wrong',
        description: `Details: ${error.message}`,
        closeText: 'Close',
      });

      return;
    }

    setResultDialog({
      open: true,
      variant: 'success',
      title: 'Password updated!',
      description:
        'Your password has been successfully changed. You can now sign in using your new password.',
      closeText: 'Continue',
    });

    reset();
  }

  return (
    <div
      className={cn('flex flex-col items-center gap-6', className)}
      {...props}>
      <Card className="w-full max-w-md">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Reset Password</h1>

                <p className="text-muted-foreground text-balance">
                  Create a new password for your account.
                </p>
              </div>

              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>New Password</FieldLabel>

                    <Input
                      {...field}
                      type="password"
                      placeholder="Enter your new password"
                      autoComplete="new-password"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Confirm Password</FieldLabel>

                    <Input
                      {...field}
                      type="password"
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Field>
                <Button type="submit" className="w-full">
                  Reset Password
                </Button>
              </Field>

              <FieldDescription className="text-center">
                <Link href="/signin">Back to Sign In</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        Choose a strong password that you haven't used before.
      </FieldDescription>

      <ResultDialog
        onOpenChange={(open) => setResultDialog({ ...resultDialog, open })}
        {...resultDialog}
      />
    </div>
  );
}
