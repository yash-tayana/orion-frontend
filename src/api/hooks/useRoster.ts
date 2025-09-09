import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import { env } from "@/config/env";
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
    const api = env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "");
    const url = `${api}/api/v1/roster?format=csv`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "text/csv",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/csv")) {
      // surface a clear error to help detect HTML misroutes
      const text = await res.text();
      throw new Error(
        `Unexpected content-type: ${
          contentType || "unknown"
        }. Body: ${text.slice(0, 200)}`
      );
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Failed to download CSV (${res.status})`);
    }
    return await res.blob();
  };

  return { list, downloadCsv } as const;
}

export default useRoster;
