'use client';

import { create } from 'zustand';

import { SignInUserValues } from '@/feature/auth/schema/auth.schema';

import {
  signInUserAction,
  signOutUserAction,
} from '@/feature/auth/actions/auth.actions';

import { AuthType } from '@/utils/auth';
import { authClient } from '@/utils/auth-client';

type AuthUser = AuthType['Session']['user'];
type AuthSession = AuthType['Session']['session'];

interface AuthStore {
  user: AuthUser | null;
  session: AuthSession | null;

  isLoading: boolean;
  isInitialized: boolean;

  setAuthSession(data: AuthType['Session'] | null): void;

  updateAuthSession: () => Promise<AuthType['Session'] | null>;

  signIn: (
    credentials: SignInUserValues
  ) => Promise<Awaited<ReturnType<typeof signInUserAction>>>;

  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,

  isLoading: false,
  isInitialized: false,

  setAuthSession: (data) => {
    set({
      user: data?.user ?? null,
      session: data?.session ?? null,
    });
  },

  updateAuthSession: async () => {
    set({
      isLoading: true,
    });

    const { data } = await authClient.getSession();

    set({
      user: data?.user ?? null,
      session: data?.session ?? null,
      isLoading: false,
    });

    return data
  },

  signIn: async (credentials) => {
    set({
      isLoading: false,
    });

    const result = await signInUserAction(credentials);
    const { data: sessionData } = await authClient.getSession();

    if (!sessionData) {
      set({
        isLoading: false,
      });

      return result;
    }

    set({
      user: sessionData.user,
      session: sessionData.session,
      isLoading: false,
    });

    return result;
  },

  signOut: async () => {
    set({
      isLoading: true,
    });

    await signOutUserAction();

    set({
      user: null,
      session: null,
      isLoading: false,
      isInitialized: false,
    });
  },
}));
