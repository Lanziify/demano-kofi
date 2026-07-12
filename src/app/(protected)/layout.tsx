import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionAction } from '@/feature/auth/actions/auth.actions';

type ProtectedPagesLayoutProps = {
  children: React.ReactNode;
};

export default async function ProtectedPagesLayout({
  children,
}: ProtectedPagesLayoutProps) {
  const { data, error } = await getSessionAction();

  if (!data || error) {
    redirect('/signin');
  }

  return <>{children}</>;
}
