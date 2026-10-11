'use client';

import React from 'react';
import type { AuthType } from '@/core/auth/auth';
import { useAuthStore } from '../store/auth-store';

type AuthProviderProps = {
  sessionData: AuthType['Session'];
  children: React.ReactNode;
};

export function AuthProvider({ sessionData, children }: AuthProviderProps) {
  const setAuthSession = useAuthStore((state) => state.setAuthSession);

  React.useEffect(() => {
    setAuthSession(sessionData);
  }, [sessionData, setAuthSession]);

  return children;
}
