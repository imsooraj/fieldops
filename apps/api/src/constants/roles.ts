export const ROLES = {
  ADMIN: "ADMIN",
  DISPATCHER: "DISPATCHER",
  TECHNICIAN: "TECHNICIAN",
  MANAGER: "MANAGER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES = Object.values(ROLES) as Role[];