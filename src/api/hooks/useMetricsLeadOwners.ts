import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import { useAuth } from "@/auth/useAuth";

export type LeadOwnerSeriesRow = { date: string; owner: string; count: number };

export type LeadOwnerSeriesResponse = {
  status: string;
  granularity: "day" | "week";
  start: string;
  end: string;
  series: LeadOwnerSeriesRow[];
};

export function useMetricsLeadOwners(params: {
  status?: string;
  start?: string;
  end?: string;
  granularity?: "day" | "week";
  tz?: string;
}) {
  const { accessToken } = useAuth();

  const query = useQuery<LeadOwnerSeriesResponse>({
    queryKey: ["metrics", "lead-owners", params],
    queryFn: async () => {
      const sp = new URLSearchParams();
      sp.set("status", params.status || "LEAD");
      if (params.start) sp.set("start", params.start);
      if (params.end) sp.set("end", params.end);
      sp.set("granularity", params.granularity || "day");
      if (params.tz) sp.set("tz", params.tz);
      const url = `/api/v1/metrics/lead-owners?${sp.toString()}`;
      return fetchJson<LeadOwnerSeriesResponse>(url, {
        token: accessToken || undefined,
      });
    },
    enabled: Boolean(accessToken),
  });

  return { series: query } as const;
}

export default useMetricsLeadOwners;
