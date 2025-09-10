import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import { useAuth } from "@/auth/useAuth";

export type AppUser = {
  id: string;
  email: string;
  displayName: string | null;
  role:
    | "SUPER_ADMIN"
    | "ADMIN"
    | "SALES"
    | "COUNSELOR"
    | "USER"
    | "MARKETER"
    | "TRAINING_ADMIN";
  createdAt?: string | null;
  lastActiveAt?: string | null;
};

export type UsersResponse = { items: AppUser[]; total: number };

export function useUsersList(
  params: { q?: string; page?: number; pageSize?: number } = {}
) {
  const { accessToken } = useAuth();
  return useQuery<UsersResponse>({
    queryKey: ["users", params],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (params.q) sp.set("q", params.q);
      if (params.page) sp.set("page", String(params.page));
      if (params.pageSize) sp.set("pageSize", String(params.pageSize));
      const url = `/api/v1/users?${sp.toString()}`;
      return fetchJson<UsersResponse>(url, { token: accessToken || undefined });
    },
    enabled: Boolean(accessToken),
  });
}

export function useUpdateUserRole() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: AppUser["role"] }) => {
      return fetchJson<void>(`/api/v1/users/${id}/role`, {
        method: "PATCH",
        body: { role },
        token: accessToken || undefined,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export type UserRoleDescription = {
  key: string;
  label: string;
  description: string;
};

export function useUserRoleDescriptions() {
  const { accessToken } = useAuth();
  return useQuery<UserRoleDescription[]>({
    queryKey: ["userRoleDescriptions"],
    queryFn: async () =>
      fetchJson<UserRoleDescription[]>("/api/v1/users/roles", {
        token: accessToken || undefined,
      }),
    enabled: Boolean(accessToken),
  });
}
