import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type React from 'react';
import { AuthProvider } from '@/components/providers/auth-provider';
import { auth } from '@/utils/auth';

type ProtectedPagesLayoutProps = {
  children: React.ReactNode;
};

export default async function ProtectedPagesLayout({
  children,
}: ProtectedPagesLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/signin');
  }

  return <AuthProvider sessionData={session}>{children}</AuthProvider>;
}
