export type Role =
  | "ADMIN"
  | "SUPER_ADMIN"
  | "USER"
  | "COUNSELOR"
  | "MARKETER"
  | "TRAINING_ADMIN";

export const isAdmin = (role?: string | null): boolean =>
  role === "ADMIN" || role === "SUPER_ADMIN";
export const isSuperAdmin = (role?: string | null): boolean =>
  role === "SUPER_ADMIN";
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
