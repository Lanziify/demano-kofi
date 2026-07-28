'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  sendVerificationOTPAction,
  SendVerificationOTPBody,
  verifyEmailOTPAction,
  VerifyEmailOTPBody,
} from '../actions/auth.actions';
import { useAuthQueries } from '../hooks/use-auth-queries';
import { otpSchema, OTPSchemaValues } from '../schema/auth.schema';

type OTPVerificationFormProps = {
  email: string;
};

export function OTPVerificationForm({ email }: OTPVerificationFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get('callbackURL');

  const { verification } = useAuthQueries({
    email,
  });


  const [timeLeft, setTimeLeft] = React.useState(0);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<OTPSchemaValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  async function onSubmit({ otp }: OTPSchemaValues) {
    const transformedValues = {
      email,
      otp,
      type: 'email-verification',
    } as VerifyEmailOTPBody;

    const { error } = await verifyEmailOTPAction(transformedValues);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Signed in successfully');

    router.refresh();
    router.replace(callbackURL ?? '/dashboard');
  }

  async function onResendSubmit() {
    if (timeLeft > 0) return;

    const values = {
      email,
      type: 'email-verification',
    } as SendVerificationOTPBody;

    const { error } = await sendVerificationOTPAction(values);

    if (error) {
      toast.error(error.message);
    }

    await verification.refetch();
  }

  React.useEffect(() => {
    if (!verification.data) return;

    const interval = setInterval(() => {
      const seconds = Math.max(
        0,
        Math.ceil(
          (new Date(verification.data.resendAvailableAt).getTime() -
            Date.now()) /
            1000
        )
      );

      setTimeLeft(seconds);
    }, 1000);

    // initialize immediately
    const seconds = Math.max(
      0,
      Math.ceil(
        (new Date(verification.data.resendAvailableAt).getTime() - Date.now()) /
          1000
      )
    );

    setTimeLeft(seconds);

    return () => clearInterval(interval);
  }, [verification.data]);

  if (verification.isPending) {
    return <Spinner />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify your account</CardTitle>
        <CardDescription>
          Enter the verification code we sent to your email address
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="otp-verification-form" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            control={control}
            name="otp"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <InputOTP maxLength={6} onChange={field.onChange}>
                  <InputOTPGroup
                    className={cn(
                      '*:data-[slot=input-otp-slot]:bg-muted gap-2 *:data-[slot=input-otp-slot]:rounded-lg *:data-[slot=input-otp-slot]:border-transparent',
                      {
                        '*:data-[slot=input-otp-slot]:ring-red-500':
                          fieldState.invalid,
                      }
                    )}>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </Field>
            )}
          />
        </form>
      </CardContent>
      <CardFooter>
        <Field>
          <Button
            type="submit"
            form="otp-verification-form"
            disabled={isSubmitting}>
            Verify
          </Button>
          <div className="text-muted-foreground text-center text-sm">
            Didn't receive a code?{' '}
            <Button
              type="button"
              variant="link"
              className="p-0"
              onClick={onResendSubmit}
              disabled={timeLeft > 0}>
              {timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend'}
            </Button>
          </div>
        </Field>
      </CardFooter>
    </Card>
  );
}
