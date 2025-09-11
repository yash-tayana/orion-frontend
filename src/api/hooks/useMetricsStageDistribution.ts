import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import { useAuth } from "@/auth/useAuth";

export type StageDistributionItem = { label: string; count: number };

export type StageDistribution = {
  items: StageDistributionItem[];
};

export function useMetricsStageDistribution(params?: { ownerUserId?: string }) {
  const { accessToken } = useAuth();

  const query = useQuery<StageDistribution>({
    queryKey: ["metrics", "stage-distribution", params?.ownerUserId || null],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (params?.ownerUserId) sp.set("ownerUserId", params.ownerUserId);
      const url = `/api/v1/metrics/stage-distribution${
        sp.toString() ? `?${sp.toString()}` : ""
      }`;
      const raw = await fetchJson<any>(url, {
        token: accessToken || undefined,
      });

      // Normalize to { items: [{label, count}] }
      let items: StageDistributionItem[] = [];
      if (raw?.items && Array.isArray(raw.items)) {
        items = raw.items.map((i: any) => ({
          label: String(i.label ?? i.stage ?? i.name ?? "Unknown"),
          count: Number(i.count ?? i.value ?? 0),
        }));
      } else if (Array.isArray(raw?.stages)) {
        items = raw.stages.map((i: any) => ({
          label: String(i.stage ?? i.name ?? "Unknown"),
          count: Number(i.count ?? i.value ?? 0),
        }));
      } else if (raw && typeof raw === "object") {
        items = Object.entries(raw as Record<string, number>).map(([k, v]) => ({
          label: String(k),
          count: Number(v as number),
        }));
      }

      return { items };
    },
    enabled: Boolean(accessToken),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  } as const;
}

export default useMetricsStageDistribution;
