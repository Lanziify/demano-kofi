'use client';

import React from 'react';
import { useAuthStore } from '@/store/auth-store';
import type { AuthType } from '@/utils/auth';

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
