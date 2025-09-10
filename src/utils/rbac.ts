export type Role =
  | "ADMIN"
  | "SUPER_ADMIN"
  | "USER"
  | "COUNSELOR"
  | "SALES"
  | "MARKETER"
  | "TRAINING_ADMIN";

export const isAdmin = (role?: string | null): boolean =>
  role === "ADMIN" || role === "SUPER_ADMIN";
export const isSuperAdmin = (role?: string | null): boolean =>
  role === "SUPER_ADMIN";
export const isSuper = (role?: string | null): boolean => isSuperAdmin(role);
export const isSales = (role?: string | null): boolean => role === "SALES";
export const isCounselor = (role?: string | null): boolean =>
  role === "COUNSELOR";
export const canViewNotes = (role?: string | null): boolean =>
  role === "ADMIN" ||
  role === "SUPER_ADMIN" ||
  role === "COUNSELOR" ||
  role === "MARKETER" ||
  role === "TRAINING_ADMIN";
export const canDeleteNote = (
  role?: string | null,
  isAuthor?: boolean
): boolean => isAuthor || role === "ADMIN" || role === "SUPER_ADMIN";

// High-level permissions used by UI (server is source of truth)
export const canWritePeople = (role?: string | null): boolean =>
  isAdmin(role) || isSuper(role) || isSales(role);
export const canSeeAllLearners = (role?: string | null): boolean =>
  isAdmin(role) || isSuper(role) || isCounselor(role);
export const canManageUsers = (role?: string | null): boolean => isSuper(role);
