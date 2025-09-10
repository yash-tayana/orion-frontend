import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import { useAuth } from "@/auth/useAuth";

export type UserProfile = {
  id: string;
  email: string;
  displayName: string | null;
  role:
    | "ADMIN"
    | "SUPER_ADMIN"
    | "USER"
    | "COUNSELOR"
    | "SALES"
    | "MARKETER"
    | "TRAINING_ADMIN";
  firstLoginAt?: string | null;
  lastLoginAt?: string | null;
};

export function useMe() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  const meQuery = useQuery<UserProfile>({
    queryKey: ["me"],
    queryFn: () =>
      fetchJson<UserProfile>("/api/v1/me", { token: accessToken || undefined }),
    enabled: Boolean(accessToken),
  });

  const updateMe = useMutation({
    mutationFn: (body: { displayName?: string | null }) =>
      fetchJson<UserProfile>("/api/v1/me", {
        method: "PATCH",
        body,
        token: accessToken || undefined,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(["me"], data);
    },
  });

  return { ...meQuery, updateMe } as const;
}

export default useMe;
