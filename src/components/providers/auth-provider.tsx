'use client';

import * as React from 'react';
import { useAuthStore } from '@/store/auth-store';
import { AuthType } from '@/utils/auth';

type AuthProviderProps = {
  sessionData: AuthType['Session'] | null;
  children: React.ReactNode;
};

export function AuthProvider({ sessionData, children }: AuthProviderProps) {
  const setAuthSession = useAuthStore((state) => state.setAuthSession);

  React.useEffect(() => {
    setAuthSession(sessionData);
  }, [sessionData, setAuthSession]);

  return <>{children}</>;
}
