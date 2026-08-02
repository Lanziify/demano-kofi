'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ReauthenticateDialog } from '@/components/custom/reauthenticate-dialog';
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useVerifyUserPassword } from '@/feature/auth/mutations/auth.mutation';
import { useUpdateEmailAddress } from '@/feature/auth/mutations/user.mutation';
import {
  type EmailChangeFormSchemaValues,
  emailChangeFormSchema,
} from '@/feature/auth/schema/account.schema';
import { useDialog } from '@/hooks/use-dialog';

export default function AccountEmailForm() {
  const [isReauthDialogOpen, setIsReauthDialogOpen] = React.useState(false);
  const resultDialog = useDialog<ResultDialogOptions>();

  const verifyUserPassword = useVerifyUserPassword();
  const updateEmailAddress = useUpdateEmailAddress();

  const form = useForm<EmailChangeFormSchemaValues>({
    resolver: zodResolver(emailChangeFormSchema),
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
    setIsReauthDialogOpen(false);
    resultDialog.setDialog(null);

    resultDialog.show({
      variant: 'loading',
      title: 'Upading email',
      description: 'Please wait while we update your email address.',
    });

    const passwordCheckResult = await verifyUserPassword.mutateAsync(password);

    if (!passwordCheckResult?.data && passwordCheckResult.error) {
      resultDialog.setDialog((prev) =>
        prev
          ? {
              ...prev,
              variant: 'error',
              title: 'Verification failed',
              description: "We couldn't verify your account. Please try again.",
            }
          : prev
      );

      return;
    }

    const emailUpdateResult = await updateEmailAddress.mutateAsync({
      newEmail: getValues('email'),
      callbackURL: '/verification/email-change-confirmation',
    });

    if (!emailUpdateResult.data && emailUpdateResult.error) {
      resultDialog.setDialog((prev) =>
        prev
          ? {
              ...prev,
              variant: 'error',
              title: 'Email update failed',
              description: `We couldn't update your email address. ${emailUpdateResult.error.message}.`,
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
            title: 'Check your new email',
            description:
              "We've sent a verification email to your new address. Verify it to complete the email change.",
          }
        : prev
    );
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
              disabled={isSubmitting}
            >
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
      {resultDialog.dialog && (
        <ResultDialog
          {...resultDialog.dialog}
          onOpenChange={(open) => {
            resultDialog.setDialog((prev) => (prev ? { ...prev, open } : prev));
          }}
        />
      )}
    </>
  );
}
