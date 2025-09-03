import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import { useAuth } from "@/auth/useAuth";

export type Person = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  linkedinUrl?: string | null;
  source?: string | null;
  stage?: string | null;
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

export type CreatePersonRequest = {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  city?: string;
  linkedinUrl?: string;
  source?: string;
  stage?: string;
  status?: string;
};

export type PatchPersonRequest = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  linkedinUrl?: string;
  source?: string;
  stage?: string;
  status?: string;
};

export function usePeople(params: {
  status?: string;
  stage?: string;
  source?: string;
  q?: string;
}) {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  const list = useQuery<Person[]>({
    queryKey: ["people", params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.set("status", params.status);
      if (params.stage) searchParams.set("stage", params.stage);
      if (params.source) searchParams.set("source", params.source);
      if (params.q) searchParams.set("q", params.q);

      const url = `/api/v1/people?${searchParams.toString()}`;
      console.log("People API URL:", url);

      return fetchJson<Person[]>(url, {
        token: accessToken || undefined,
      });
    },
    enabled: Boolean(accessToken),
  });

  const createLearner = useMutation({
    mutationFn: (payload: CreatePersonRequest) => {
      console.log("Create learner payload:", JSON.stringify(payload, null, 2));
      return fetchJson<Person>("/api/v1/people", {
        method: "POST",
        body: payload,
        token: accessToken || undefined,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["people"] }),
  });

  const patchLearner = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: PatchPersonRequest;
    }) => {
      console.log("Patch learner payload:", JSON.stringify(payload, null, 2));
      return fetchJson<Person>(`/api/v1/people/${id}`, {
        method: "PATCH",
        body: payload,
        token: accessToken || undefined,
      });
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      queryClient.invalidateQueries({ queryKey: ["person", id] });
    },
  });

  // Legacy aliases for backward compatibility
  const create = createLearner;
  const update = patchLearner;

  return { list, createLearner, patchLearner, create, update } as const;
}

export default usePeople;
