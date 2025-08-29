export type Role = "ADMIN" | "USER";

export const isAdmin = (role?: string | null): boolean => role === "ADMIN";
