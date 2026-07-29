'use client';

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
import { Controller, useForm } from 'react-hook-form';
import {
  forgotPasswordSchema,
  ForgotPasswordValues,
} from '../schema/auth.schema';

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { theme } = useTheme();

  const { control, handleSubmit, reset } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    // const { error } = await forgotPassword(values);

    // if (error) {
    //   toast.error(error.message);
    //   return;
    // }

    // toast.success('If an account exists, a password reset link has been sent.');

    reset();
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
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

          <div className="bg-muted relative hidden items-center justify-center md:flex">
            <div className="h-48 w-48">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill={theme === 'light' ? '#000000' : '#ffffff'}
                width="100%"
                height="100%"
                viewBox="0 0 24 24">
                <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 0 1 6 0v3H9zm3 3a2 2 0 0 1 1 3.732V18h-2v-1.268A2 2 0 0 1 12 13z" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        We'll never share your email with anyone else.
      </FieldDescription>
    </div>
  );
}
