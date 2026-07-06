export const ADMIN_ROLES = ["admin", "super_admin"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ROLE_USER = "user";
export const ROLE_ADMIN = "admin";
export const ROLE_SUPER_ADMIN = "super_admin";

export enum ADMIN_STATUS {
  ACTIVE = "active",
  INACTIVE = "inactive",
}
