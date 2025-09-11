import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import { useAuth } from "@/auth/useAuth";

export type StatusTrendPoint = {
  date: string;
  [status: string]: number | string;
};

export type StatusTrends = {
  granularity: "day" | "week" | "month";
  start: string;
  end: string;
  series: StatusTrendPoint[];
};

export function useMetricsStatusTrends(params: {
  start?: string;
  end?: string;
  granularity?: "day" | "week" | "month";
  ownerUserId?: string;
}) {
  const { accessToken } = useAuth();

  const query = useQuery<StatusTrends>({
    queryKey: ["metrics", "status-trends", params],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (params.start) sp.set("start", params.start);
      if (params.end) sp.set("end", params.end);
      if (params.granularity) sp.set("granularity", params.granularity);
      if (params.ownerUserId) sp.set("ownerUserId", params.ownerUserId);
      const url = `/api/v1/metrics/status-trends${
        sp.toString() ? `?${sp.toString()}` : ""
      }`;
      return fetchJson<StatusTrends>(url, { token: accessToken || undefined });
    },
    enabled: Boolean(accessToken),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  } as const;
}

export default useMetricsStatusTrends;
