import { CircleX } from 'lucide-react';
import { Empty, EmptyDescription, EmptyHeader } from '@/components/ui/empty';
import { OTPVerificationForm } from '@/feature/auth/components/otp-verification-form';

type VerifyAccountPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function VerifyAccountPage({
  searchParams,
}: VerifyAccountPageProps) {
  const { email } = await searchParams;
  const decodedEmail = decodeURIComponent(email as string);

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

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <OTPVerificationForm email={decodedEmail} />
    </div>
  );
}
