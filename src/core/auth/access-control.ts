import { createAccessControl } from 'better-auth/plugins';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';

/**
 * Resources and the actions that can be granted on them, used by better-auth's `admin` plugin.
 * Starts with better-auth's built-in `user` and `session` resources. Add app resources here when
 * a feature needs permission checks, e.g. `product: ['create', 'update', 'delete']`.
 */
const statements = {
  ...defaultStatements,
} as const;

export const platformAccessControl = createAccessControl(statements);

export const appRoles = {
  admin: platformAccessControl.newRole({
    ...adminAc.statements,
  }),
  user: platformAccessControl.newRole({}),
};

export const APP_ROLES = {
  admin: 'admin',
  user: 'user',
} as const satisfies Record<keyof typeof appRoles, string>;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];
