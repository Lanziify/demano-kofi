'use client';

import { zodResolver } from '@hookform/resolvers/zod';

import { Controller, useForm } from 'react-hook-form';
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
import { useChangePassword } from '@/feature/auth/mutations/user.mutation';
import {
  type PasswordUpdateSchemaValues,
  passwordUpdateSchema,
} from '@/feature/auth/schema/account.schema';
import { useDialog } from '@/hooks/use-dialog';

export default function AccountPasswordForm() {
  const changePassword = useChangePassword();
  const resultDialog = useDialog<ResultDialogOptions>();

  const form = useForm<PasswordUpdateSchemaValues>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: {
      currentPassword: '',
      password: '',
      confirmPassword: '',
    },
  });

  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  async function onSubmit(values: PasswordUpdateSchemaValues) {
    resultDialog.setDialog(null);

    resultDialog.show({
      variant: 'loading',
      title: 'Changing password',
      description: 'Please wait while we update your password.',
    });

    const passwordChangeResult = await changePassword.mutateAsync({
      currentPassword: values.currentPassword,
      newPassword: values.password,
    });

    if (!passwordChangeResult?.data && passwordChangeResult.error) {
      resultDialog.setDialog((prev) =>
        prev
          ? {
              ...prev,
              variant: 'error',
              title: 'Password change failed',
              description:
                "We couldn't change your password at this time. Please try again.",
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
            title: 'Password changed',
            description: 'Your password has been updated successfully.',
          }
        : prev
    );

    reset();
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
                name="password"
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
                name="confirmPassword"
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
              disabled={isSubmitting}
            >
              {isSubmitting && <Spinner />}
              Update Password
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
    </>
  );
}
