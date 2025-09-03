import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import { useAuth } from "@/auth/useAuth";

export type StagesByStatus = {
  [status: string]: string[];
};

export type StagesPayload = {
  stagesByStatus: StagesByStatus;
};

export function useStages() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  const updateStages = useMutation({
    mutationFn: (payload: StagesPayload) =>
      fetchJson<StagesPayload>("/api/v1/settings/stages", {
        method: "PATCH",
        body: payload,
        token: accessToken || undefined,
      }),
    onSuccess: () => {
      // Invalidate settings query to refetch
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  return { updateStages } as const;
}

export default useStages;
