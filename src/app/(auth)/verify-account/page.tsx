import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
} from '@/components/ui/empty';
import { verifyEmailOTPExistence } from '@/feature/auth/actions/auth.actions';
import { OTPVerificationForm } from '@/feature/auth/components/otp-verification-form';
import { CircleX } from 'lucide-react';
import Link from 'next/link';

type VerifyAccountPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function VerifyAccountPage({
  searchParams,
}: VerifyAccountPageProps) {
  const { email } = await searchParams;
  const decodedEmail = decodeURIComponent(email as string);

  let userWithVerification:
    Awaited<ReturnType<typeof verifyEmailOTPExistence>> | undefined;

  if (email) {

    userWithVerification = await verifyEmailOTPExistence(decodedEmail);
  }

  if (!email) {
    return (
      <Empty className="border-none p-4">
        <EmptyHeader>
          <CircleX className="text-muted-foreground size-10" />

          <h2 className="text-2xl font-bold">Missing Property</h2>

          <EmptyDescription>
            Could not proceed with missing property
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (userWithVerification?.error) {
    return (
      <Empty className="border-none p-4">
        <EmptyHeader>
          <CircleX className="text-muted-foreground size-10" />

          <h2 className="text-2xl font-bold">
            {userWithVerification.error.message}
          </h2>

          <EmptyDescription>{userWithVerification.error.code}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>
            <Link
              href={`/signin?otpError=${userWithVerification.error.code}&email=${encodeURIComponent(decodedEmail)}`}>
              Go back to Sign In page
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <OTPVerificationForm />
    </div>
  );
}
