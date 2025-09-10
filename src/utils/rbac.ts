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
export const norm = (s?: string | null): string =>
  (s || "").trim().toLowerCase();
export const sameId = (a?: string | null, b?: string | null): boolean =>
  !!a && !!b && norm(a) === norm(b);
export const canViewNotes = (role?: string | null): boolean =>
  role === "ADMIN" ||
  role === "SUPER_ADMIN" ||
  role === "COUNSELOR" ||
  role === "MARKETER" ||
  role === "TRAINING_ADMIN" ||
  role === "SALES";
export const canDeleteNote = (
  role?: string | null,
  meId?: string | null,
  noteAuthorId?: string | null
): boolean =>
  isSuper(role) ||
  isAdmin(role) ||
  isSales(role) ||
  sameId(meId ?? null, noteAuthorId ?? null);

// High-level permissions used by UI (server is source of truth)
export const canWritePeople = (role?: string | null): boolean =>
  isAdmin(role) || isSuper(role) || isSales(role);
export const canSeeAllLearners = (role?: string | null): boolean =>
  isAdmin(role) || isSuper(role) || isCounselor(role);
export const canManageUsers = (role?: string | null): boolean => isSuper(role);
export const canCreateLearner = (role?: string | null): boolean =>
  isSales(role) || isAdmin(role) || isSuper(role);
export const canAddNotes = (
  role?: string | null,
  meId?: string | null,
  personOwnerId?: string | null
): boolean => isAdmin(role) || isSuper(role) || isSales(role);
export const canEditLearner = (
  role?: string | null,
  meId?: string | null,
  ownerUserId?: string | null
): boolean => isSuper(role) || isAdmin(role) || isSales(role);

export const canPromoteLearner = canEditLearner;
export const canDeleteNoteStrict = (
  role?: string | null,
  meId?: string,
  noteAuthorId?: string | null
): boolean =>
  isSuper(role) || isAdmin(role) || sameId(meId ?? null, noteAuthorId ?? null);
