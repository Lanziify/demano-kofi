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
import { useAuthStore } from '@/store/auth-store';

import { useUpdateUsername } from '@/feature/auth/mutations/user.mutation';
import {
  usernameUpdateSchema,
  type UsernameUpdateSchemaValues,
} from '@/feature/auth/schema/account.schema';
import { toast } from 'sonner';

export default function AccountUsernameForm() {
  const user = useAuthStore((state) => state.user);
  const updateUsername = useUpdateUsername();

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
    await updateUsername.mutateAsync(values);

    if (updateUsername.isError) {
      toast.error(updateUsername.error.message);
    }

    toast.success('Profile updated!');
  }

  return (
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
                    Username identifies your account and is used for signing in.
                    Keep it unique and easy to remember.
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
  );
}
