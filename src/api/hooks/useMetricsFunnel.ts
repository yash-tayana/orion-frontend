import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import { useAuth } from "@/auth/useAuth";

export type FunnelStage = { label: string; count: number };

export type Funnel = {
  stages: FunnelStage[];
};

export function useMetricsFunnel(params?: { ownerUserId?: string }) {
  const { accessToken } = useAuth();

  const query = useQuery<Funnel>({
    queryKey: ["metrics", "funnel", params?.ownerUserId || null],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (params?.ownerUserId) sp.set("ownerUserId", params.ownerUserId);
      const url = `/api/v1/metrics/funnel${
        sp.toString() ? `?${sp.toString()}` : ""
      }`;
      const raw = await fetchJson<any>(url, {
        token: accessToken || undefined,
      });

      if (raw?.stages && Array.isArray(raw.stages)) return raw as Funnel;
      if (Array.isArray(raw)) {
        return {
          stages: raw.map((i: any) => ({
            label: String(i.label ?? i.name ?? ""),
            count: Number(i.count ?? i.value ?? 0),
          })),
        };
      }
      if (raw && typeof raw === "object") {
        return {
          stages: Object.entries(raw as Record<string, number>).map(
            ([k, v]) => ({ label: String(k), count: Number(v as number) })
          ),
        };
      }
      return { stages: [] };
    },
    enabled: Boolean(accessToken),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  } as const;
}

export default useMetricsFunnel;
