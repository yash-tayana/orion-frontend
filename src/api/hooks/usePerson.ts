import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import { useAuth } from "@/auth/useAuth";
import type { Person } from "./usePeople";

export function usePerson(id?: string) {
  const { accessToken } = useAuth();

  return useQuery<Person>({
    queryKey: ["person", id],
    queryFn: () =>
      fetchJson<Person>(`/api/v1/people/${id}`, {
        token: accessToken || undefined,
      }),
    enabled: Boolean(accessToken && id),
  });
}

export default usePerson;
