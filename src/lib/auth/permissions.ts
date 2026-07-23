import { createAccessControl } from "better-auth/plugins";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

export const platformAccessControl = createAccessControl({
  ...defaultStatements,
});

// export const organizationAccessControl = createAccessControl({
//   ...{ team: ['create', 'read', 'update', 'delete'] },
// });

export const appRoles = {
  admin: platformAccessControl.newRole({
    ...adminAc.statements,
  }),
  user: platformAccessControl.newRole({}),
};
