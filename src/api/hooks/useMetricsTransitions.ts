import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import { useAuth } from "@/auth/useAuth";

export type TransitionPoint = {
  date: string;
  transition: "PROMOTED" | "DEMOTED";
  count: number;
};

export type TransitionsResponse = TransitionPoint[];

export function useMetricsTransitions(params: {
  start?: string;
  end?: string;
  granularity?: "day" | "week" | "month";
  tz?: string;
  ownerUserId?: string;
}) {
  const { accessToken } = useAuth();

  const query = useQuery<TransitionsResponse>({
    queryKey: ["metrics", "transitions", params],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (params.start) sp.set("start", params.start);
      if (params.end) sp.set("end", params.end);
      if (params.granularity) sp.set("granularity", params.granularity);
      if (params.tz) sp.set("tz", params.tz);
      if (params.ownerUserId) sp.set("ownerUserId", params.ownerUserId);
      const url = `/api/v1/metrics/transitions${
        sp.toString() ? `?${sp.toString()}` : ""
      }`;
      return fetchJson<TransitionsResponse>(url, {
        token: accessToken || undefined,
      });
    },
    enabled: Boolean(accessToken),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  } as const;
}

export default useMetricsTransitions;
