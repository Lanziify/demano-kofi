import { createAuthClient } from 'better-auth/client';
import {
  adminClient,
  inferAdditionalFields,
  organizationClient,
  usernameClient,
} from 'better-auth/client/plugins';
import type { auth } from './auth';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
  fetchOptions: {
    cache: 'default', // Enable browser caching
  },
  plugins: [
    adminClient(),
    organizationClient(),
    usernameClient(),
    inferAdditionalFields<typeof auth>(),
  ],
});
