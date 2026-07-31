'use client';

import { create } from 'zustand';

import { SignInSchemaValues } from '@/feature/auth/schema/auth.schema';

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
  isRefreshing: boolean;

  setAuthSession(data: AuthType['Session']): void;

  updateAuthSession: () => Promise<AuthType['Session'] | null>;

  signIn: (
    credentials: SignInSchemaValues
  ) => Promise<Awaited<ReturnType<typeof signInUserAction>>>;

  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,

  isLoading: false,
  isInitialized: false,
  isRefreshing: false,

  setAuthSession: (data) => {
    set({
      user: data.user,
      session: data.session,
      isLoading: false,
      isInitialized: true,
    });
  },

  updateAuthSession: async () => {
    set({
      isRefreshing: true,
    });

    const { data } = await authClient.getSession();

    if (!data) {
      set({
        isRefreshing: false,
      });

      return data;
    }

    get().setAuthSession(data);

    set({
      isRefreshing: false,
    });

    return data;
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

    get().setAuthSession(sessionData);

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
