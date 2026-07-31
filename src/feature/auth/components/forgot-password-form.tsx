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
import Link from 'next/link';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { requestPasswordResetAction } from '../actions/auth.actions';
import {
  RequestPasswordResetSchemaValues,
  requestPasswordResetSchema,
} from '../schema/auth.schema';

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
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
    useForm<RequestPasswordResetSchemaValues>({
      resolver: zodResolver(requestPasswordResetSchema),
      defaultValues: {
        email: '',
        redirectTo: '/reset-password',
      },
    });

  async function onSubmit(values: RequestPasswordResetSchemaValues) {
    setResultDialog({
      open: true,
      variant: 'loading',
      title: 'Verifying your account',
    });

    const { error } = await requestPasswordResetAction(values);

    if (error) {
      setResultDialog({
        open: true,
        variant: 'error',
        title: "Something wen't wrong",
        description: `Details: ${error.message}`,
        closeText: 'Close',
      });

      return;
    }

    setResultDialog({
      open: true,
      variant: 'success',
      title: "We've sent you an email",
      description:
        'Please check your new email inbox and click the reset link to complete the change.',
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
                <h1 className="text-2xl font-bold">Forgot Password?</h1>

                <p className="text-muted-foreground text-balance">
                  Enter your email address and we'll send you a password reset
                  link.
                </p>
              </div>

              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Email Address</FieldLabel>

                    <Input
                      {...field}
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Field>
                <Button type="submit" className="w-full">
                  Send Reset Link
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Remember your password?{' '}
                <Link href="/signin">Back to Sign In</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        We'll never share your email with anyone else.
      </FieldDescription>

      <ResultDialog
        onOpenChange={(open) => setResultDialog({ ...resultDialog, open })}
        {...resultDialog}
      />
    </div>
  );
}
