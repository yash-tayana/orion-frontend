import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import { useAuth } from "@/auth/useAuth";

export type SourcesPayload = {
  sources: string[];
};

export function useUpdateSources() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  const updateSources = useMutation({
    mutationFn: (payload: SourcesPayload) =>
      fetchJson<SourcesPayload>("/api/v1/settings/sources", {
        method: "PATCH",
        body: payload,
        token: accessToken || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  return { updateSources } as const;
}

export default useUpdateSources;
