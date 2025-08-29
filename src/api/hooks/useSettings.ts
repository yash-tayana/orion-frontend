import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import { useAuth } from "@/auth/useAuth";

export type Settings = {
  meetingLink?: string | null;
  sources?: string[];
  counselingEmbedUrl?: string | null;
};

export function useSettings() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  const settings = useQuery<Settings>({
    queryKey: ["settings"],
    queryFn: () =>
      fetchJson<Settings>("/api/v1/settings", {
        token: accessToken || undefined,
      }),
    enabled: Boolean(accessToken),
  });

  const update = useMutation({
    mutationFn: (body: Settings) =>
      fetchJson<Settings>("/api/v1/settings", {
        method: "PATCH",
        body,
        token: accessToken || undefined,
      }),
    onSuccess: (data) => queryClient.setQueryData(["settings"], data),
  });

  return { settings, update } as const;
}

export default useSettings;
