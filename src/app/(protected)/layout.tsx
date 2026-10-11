import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type React from 'react';
import { auth } from '@/core/auth/auth';
import { AuthProvider } from '@/feature/auth/client';

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
