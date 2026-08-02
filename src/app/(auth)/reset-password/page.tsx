import { CircleX } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader } from '@/components/ui/empty';
import { ResetPasswordForm } from '@/feature/auth/components/reset-password-form';

type ResetPasswordProps = {
  searchParams: Promise<{ token?: string; error?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordProps) {
  const { token, error } = await searchParams;

  if (error || !token) {
    return (
      <Empty className="border-none p-4">
        <EmptyHeader>
          <CircleX className="text-muted-foreground size-10" />

          <h2 className="text-2xl font-bold">Oops, an error occurred!</h2>

          <EmptyDescription>
            Could not proceed with invalid or expired token. Please request a
            new one.
          </EmptyDescription>
          <Button render={<Link href={'/signin'} />}>Go back to Sign In</Button>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <ResetPasswordForm token={token} />
    </div>
  );
}
