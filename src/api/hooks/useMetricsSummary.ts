import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import { useAuth } from "@/auth/useAuth";

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

  const metricsQuery = useQuery<MetricsSummary>({
    queryKey: ["metricsSummary"],
    queryFn: async () => {
      const data = await fetchJson<MetricsSummary>("/api/v1/metrics/summary", {
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
