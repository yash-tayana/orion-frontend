import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import { useAuth } from "@/auth/useAuth";
import type { Person } from "./usePeople";

export type Transition = {
  toStatus: string;
  reason?: string | null;
  createdAt: string;
};

export function useTransitions(personId: string) {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  // Fetch transitions for a person
  const transitions = useQuery<Transition[]>({
    queryKey: ["transitions", personId],
    queryFn: () =>
      fetchJson<Transition[]>(`/api/v1/people/${personId}/transitions`, {
        token: accessToken || undefined,
      }),
    enabled: Boolean(accessToken && personId),
  });

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
      queryClient.invalidateQueries({ queryKey: ["transitions", personId] });
    },
  });

  return { transitions, transition } as const;
}

export default useTransitions;
