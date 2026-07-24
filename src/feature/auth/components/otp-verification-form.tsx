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
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { otpSchema, OTPSchemaValues } from '../schema/auth.schema';

export function OTPVerificationForm() {
  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = useForm<OTPSchemaValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  async function onSubmit(values: OTPSchemaValues) {
    console.log(values);
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
                      {"*:data-[slot=input-otp-slot]:ring-red-500": fieldState.invalid}
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
            <Button variant="link" className="p-0">
              Resend
            </Button>
          </div>
        </Field>
      </CardFooter>
    </Card>
  );
}
