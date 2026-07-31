'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader } from '@/components/ui/empty';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { signUpUserAction } from '../actions/auth.actions';
import { signUpSchema, SignUpSchemaValues } from '../schema/auth.schema';

type VerificationStatus =
  'idle' | 'creating' | 'redirecting' | 'completed' | 'error';

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get('callbackURL');
  const { theme } = useTheme();

  const [status, setStatus] = React.useState<VerificationStatus>('idle');

  const signInLink = new URL(`${process.env.NEXT_PUBLIC_SERVER_URL!}/signin`);

  const verificationLink = new URL(
    `${process.env.NEXT_PUBLIC_SERVER_URL!}/verify-account`
  );

  if (callbackURL) {
    signInLink.searchParams.append('callbackURL', callbackURL);
    verificationLink.searchParams.append('callbackURL', callbackURL);
  }

  const { control, handleSubmit, getValues } = useForm<SignUpSchemaValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      rememberMe: false,
      callbackURL: verificationLink.toString(),
    },
  });

  async function onSubmit(values: SignUpSchemaValues) {
    setStatus('creating');

    const { error } = await signUpUserAction(values);

    if (error) {
      toast.error(error.message);
      setStatus('error');
      return;
    }

    setStatus('redirecting');
  }

  React.useEffect(() => {
    if (status !== 'redirecting') return;

    verificationLink.searchParams.append('email', getValues('email'));

    const timer = setTimeout(() => {
      router.refresh();
      router.replace(verificationLink.toString());
    }, 2500);

    return () => clearTimeout(timer);
  }, [status, router]);

  if (status === 'redirecting') {
    return (
      <Empty className="border-none p-4">
        <EmptyHeader>
          <MailIcon className="text-muted-foreground size-10" />

          <h2 className="text-2xl font-bold">Verification in Progress</h2>

          <EmptyDescription>
            Redirecting you to continue verification…
          </EmptyDescription>

          <Spinner />
        </EmptyHeader>
      </Empty>
    );
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
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your email below to create your account
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>First Name</FieldLabel>
                      <Input {...field} placeholder="Juan" />

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="lastName"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Last name</FieldLabel>
                      <Input {...field} placeholder="Cruz" />

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="username"
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                    <Input {...field} placeholder="Juan_23" />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      {...field}
                      type="email"
                      placeholder="email@example.com"
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
                  <Field>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input {...field} type="password" placeholder="••••••••" />

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
                    <FieldLabel htmlFor={field.name}>
                      Confirm Password
                    </FieldLabel>
                    <Input {...field} type="password" placeholder="••••••••" />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Field>
                <Button type="submit">Sign Up</Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field>
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Sign up with Google
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Already have an account?{' '}
                <Link href={signInLink.toString()}>Sign in</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{' '}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
