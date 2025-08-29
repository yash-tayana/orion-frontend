import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import { useAuth } from "@/auth/useAuth";
import type { Person } from "./usePeople";

export function useTransitions(personId: string) {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  const transition = useMutation({
    mutationFn: (body: { toStatus: string; reason?: string }) =>
      fetchJson<Person>(`/api/v1/people/${personId}/transition`, {
        method: "POST",
        body,
        token: accessToken || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      queryClient.invalidateQueries({ queryKey: ["person", personId] });
    },
  });

  return { transition } as const;
}

export default useTransitions;
