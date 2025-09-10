import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import { useAuth } from "@/auth/useAuth";
import { useMe } from "@/api/hooks/useMe";
import { isSales } from "@/utils/rbac";

export type MetricsSummary = {
  countsByStatus: {
    SUSPECT: number;
    LEAD: number;
    CANDIDATE_FREE: number;
    CANDIDATE_PAID: number;
    ALUMNI: number;
    DEFERRED: number;
    DISCONTINUED: number;
  };
  promotionsLast7d: number;
  topSources: Array<{
    source: string;
    count: number;
  }>;
};

export function useMetricsSummary() {
  const { accessToken } = useAuth();
  const { data: me } = useMe();

  const metricsQuery = useQuery<MetricsSummary>({
    queryKey: ["metricsSummary"],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (isSales(me?.role) && me?.id) sp.set("ownerUserId", me.id);
      const url = `/api/v1/metrics/summary${
        sp.toString() ? `?${sp.toString()}` : ""
      }`;
      const data = await fetchJson<MetricsSummary>(url, {
        token: accessToken || undefined,
      });

      // Log the exact JSON for debugging
      console.log("Metrics summary JSON:", JSON.stringify(data, null, 2));

      return data;
    },
    enabled: Boolean(accessToken),
  });

  return metricsQuery;
}

export default useMetricsSummary;
