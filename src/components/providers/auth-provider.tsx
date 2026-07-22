'use client';

import React from 'react';
import { useAuthStore } from '@/store/auth-store';
import { AuthType } from '@/utils/auth';

type AuthProviderProps = {
  sessionData: AuthType['Session'];
  children: React.ReactNode;
};

export function AuthProvider({ sessionData, children }: AuthProviderProps) {
  const initialized = React.useRef(false);
  const setAuthSession = useAuthStore((state) => state.setAuthSession);

  if (!initialized.current) {
    setAuthSession(sessionData);

    useAuthStore.setState({
      isInitialized: true,
    });

    initialized.current = true;
  }

  return children;
}
