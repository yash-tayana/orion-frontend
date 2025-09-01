import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import { useAuth } from "@/auth/useAuth";

export function useRoster() {
  const { accessToken } = useAuth();

  type RosterPerson = {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
  };

  const list = useQuery<RosterPerson[]>({
    queryKey: ["roster"],
    queryFn: () =>
      fetchJson<RosterPerson[]>("/api/v1/roster", {
        token: accessToken || undefined,
      }),
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
