import { env } from "@/config/env";
import { ApiError } from "./errors";

type JsonValue =
  | Record<string, unknown>
  | unknown[]
  | string
  | number
  | boolean
  | null;

export async function fetchJson<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    body?: JsonValue;
    headers?: Record<string, string>;
    token?: string | null;
    accept?: string;
  } = {}
): Promise<T> {
  const url = `${env.NEXT_PUBLIC_API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    ...(options.accept
      ? { Accept: options.accept }
      : { Accept: "application/json" }),
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const res = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    let code: string | undefined;
    let message = `Request failed with status ${res.status}`;
    let details: unknown;
    let correlationId: string | undefined;

    try {
      const data = (await res.json()) as any;
      if (data?.error) {
        code = data.error.code;
        message = data.error.message || message;
        details = data.error.details;
        correlationId = data.error.correlationId;
      }
    } catch {
      // ignore parse errors
    }
    throw new ApiError({
      status: res.status,
      code,
      message,
      details,
      correlationId,
    });
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.blob()) as T;
}
