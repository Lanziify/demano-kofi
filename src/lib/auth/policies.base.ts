import { Policy } from "./policies";

export const BasePolicies = {
  invitation: {
    label: "Invitation Management",
    description: "Manage campus invitations",

    actions: {
      create: {
        label: "Create Invitation",
        description: "Can send invitations",
      },

      read: {
        label: "View Invitations",
        description: "Can view pending invitations",
      },

      revoke: {
        label: "Revoke Invitation",
        description: "Can cancel invitations",
      },
    },
  },

  role: {
    label: "Role Assignment",
    description: "Assign roles to members",

    actions: {
      assign: {
        label: "Assign Roles",
        description: "Can assign roles to members",
      },

      update: {
        label: "Update Assigned Roles",
        description: "Can change member roles",
      },
    },
  },

  ac: {
    label: "Access Control",
    description: "Manage dynamic roles and permissions",

    actions: {
      create: {
        label: "Create Role",
        description: "Can create organization roles",
      },

      read: {
        label: "View Roles",
        description: "Can view organization roles",
      },

      update: {
        label: "Update Role",
        description: "Can modify organization roles",
      },

      delete: {
        label: "Delete Role",
        description: "Can remove organization roles",
      },
    },
  },
} as const satisfies Policy;
