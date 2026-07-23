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

import { ReauthenticateDialog } from '@/components/custom/reauthenticate-dialog';
import { SuccessDialog } from '@/components/custom/success-dialog';
import {
  useUpdateEmailAddress,
  useVerifyUserPassword,
} from '@/feature/auth/mutations/user.mutation';
import {
  emailUpdateSchema,
  type EmailUpdateSchemaValues,
} from '@/feature/auth/schema/account.schema';
import React from 'react';

export default function AccountEmailForm() {
  const [isReauthDialogOpen, setIsReauthDialogOpen] = React.useState(false);
  const [isSuccessDialogOpen, setSuccessDialogOpen] = React.useState(false);
  const verifyUserPassword = useVerifyUserPassword();
  const updateEmailAddress = useUpdateEmailAddress();

  const form = useForm<EmailUpdateSchemaValues>({
    resolver: zodResolver(emailUpdateSchema),
    defaultValues: {
      email: '',
      confirmEmail: '',
    },
  });

  const {
    control,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = form;

  async function onSubmit() {
    setIsReauthDialogOpen(true);
  }

  async function handleEmailChange(password: string) {
    const passwordCheckResult = await verifyUserPassword.mutateAsync(password);

    if (!passwordCheckResult?.status) {
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Email Address</CardTitle>
          <CardDescription>
            Update the email address associated with your account. A
            verification email may be sent to confirm your new address.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form id="email-change-form" onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      New email address
                    </FieldLabel>
                    <Input {...field} placeholder="new@example.com" />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="confirmEmail"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Confirm new email
                    </FieldLabel>
                    <Input {...field} placeholder="new@example.com" />

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
              form="email-change-form"
              disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              Update Email
            </Button>
          </Field>
        </CardFooter>
      </Card>
      <ReauthenticateDialog
        open={isReauthDialogOpen}
        onOpenChange={setIsReauthDialogOpen}
        onConfirm={handleEmailChange}
      />
      <SuccessDialog
        open={isSuccessDialogOpen}
        onOpenChange={setSuccessDialogOpen}
        title="Verification email sent"
        description={
          <>
            We've sent a verification link to{' '}
            <strong>{getValues('email')}</strong>.
            <br />
            Please check your inbox and confirm your new email address.
          </>
        }
      />
    </>
  );
}
