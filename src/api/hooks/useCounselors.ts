import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import { useAuth } from "@/auth/useAuth";

export type Counselor = {
  id: string;
  name: string;
  embedUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateCounselorPayload = {
  name: string;
  embedUrl: string;
  isActive: boolean;
};

export type UpdateCounselorPayload = {
  name?: string;
  embedUrl?: string;
  isActive?: boolean;
};

// Helper function to normalize counselor data (handle both isActive and active)
function normalizeCounselor(counselor: unknown): Counselor {
  const c = counselor as Record<string, unknown>;
  return {
    id: c.id as string,
    name: c.name as string,
    embedUrl: c.embedUrl as string,
    isActive: (c.isActive ?? c.active ?? true) as boolean,
    createdAt: c.createdAt as string,
    updatedAt: c.updatedAt as string,
  };
}

export function useCounselors(filter: "all" | "active" | "inactive" = "all") {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  const counselorsQuery = useQuery<Counselor[]>({
    queryKey: ["counselors", filter],
    queryFn: async () => {
      const queryParam =
        filter === "all" ? "active=all" : `active=${filter === "active"}`;
      console.log(`GET /api/v1/counselors?${queryParam}`);
      const data = await fetchJson<unknown[]>(
        `/api/v1/counselors?${queryParam}`,
        {
          token: accessToken || undefined,
        }
      );
      return data.map(normalizeCounselor);
    },
    enabled: Boolean(accessToken),
  });

  const createCounselor = useMutation({
    mutationFn: async (payload: CreateCounselorPayload) => {
      console.log(
        "Create counselor payload:",
        JSON.stringify(payload, null, 2)
      );
      const data = await fetchJson<unknown>("/api/v1/counselors", {
        method: "POST",
        body: payload,
        token: accessToken || undefined,
      });
      return normalizeCounselor(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counselors"] });
    },
  });

  const updateCounselor = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCounselorPayload;
    }) => {
      console.log(
        "Update counselor payload:",
        JSON.stringify(payload, null, 2)
      );
      const data = await fetchJson<unknown>(`/api/v1/counselors/${id}`, {
        method: "PATCH",
        body: payload,
        token: accessToken || undefined,
      });
      return normalizeCounselor(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counselors"] });
    },
  });

  const deleteCounselor = useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/v1/counselors/${id}`, {
        method: "DELETE",
        token: accessToken || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counselors"] });
    },
  });

  return {
    counselors: counselorsQuery,
    create: createCounselor,
    update: updateCounselor,
    delete: deleteCounselor,
  } as const;
}

export default useCounselors;
