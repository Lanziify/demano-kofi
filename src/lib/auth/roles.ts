import { appRoles } from './permissions';

export const APP_ROLES = {
  admin: 'admin',
  user: 'user',
} as const satisfies Record<keyof typeof appRoles, string>;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];
