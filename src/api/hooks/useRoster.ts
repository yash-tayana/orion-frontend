import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import { useAuth } from "@/auth/useAuth";

export function useRoster() {
  const { accessToken } = useAuth();

  const list = useQuery<any[]>({
    queryKey: ["roster"],
    queryFn: () =>
      fetchJson<any[]>("/api/v1/roster", { token: accessToken || undefined }),
    enabled: Boolean(accessToken),
  });

  const downloadCsv = async (): Promise<Blob> => {
    return fetchJson<Blob>("/api/v1/roster", {
      token: accessToken || undefined,
      accept: "text/csv",
    });
  };

  return { list, downloadCsv } as const;
}

export default useRoster;
