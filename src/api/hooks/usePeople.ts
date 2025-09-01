import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import { useAuth } from "@/auth/useAuth";

export type Person = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedinUrl?: string | null;
  source?: string | null;
  status:
    | "SUSPECT"
    | "LEAD"
    | "CANDIDATE_FREE"
    | "CANDIDATE_PAID"
    | "ALUMNI"
    | "DEFERRED"
    | "DISCONTINUED";
  createdAt: string;
  updatedAt: string;
  transitions?: {
    toStatus: string;
    reason?: string | null;
    createdAt: string;
  }[];
};

export function usePeople(params: { status?: string; q?: string }) {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  const list = useQuery<Person[]>({
    queryKey: ["people", params],
    queryFn: () =>
      fetchJson<Person[]>(
        `/api/v1/people?status=${encodeURIComponent(
          params.status || ""
        )}&q=${encodeURIComponent(params.q || "")}`,
        { token: accessToken || undefined }
      ),
    enabled: Boolean(accessToken),
  });

  const create = useMutation({
    mutationFn: (body: Partial<Person>) =>
      fetchJson<Person>("/api/v1/people", {
        method: "POST",
        body,
        token: accessToken || undefined,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["people"] }),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Person> }) =>
      fetchJson<Person>(`/api/v1/people/${id}`, {
        method: "PATCH",
        body,
        token: accessToken || undefined,
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      queryClient.invalidateQueries({ queryKey: ["person", id] });
    },
  });

  return { list, create, update } as const;
}

export default usePeople;
