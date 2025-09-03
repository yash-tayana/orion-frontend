import { env } from "@/config/env";
import { ApiError, toUserMessage } from "./errors";

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
    body?: JsonValue | FormData;
    headers?: Record<string, string>;
    token?: string | null;
    accept?: string;
  } = {}
): Promise<T> {
  const url = `${env.NEXT_PUBLIC_API_BASE_URL}${path}`;
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(options.accept
      ? { Accept: options.accept }
      : { Accept: "application/json" }),
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const res = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body
      ? isFormData
        ? (options.body as FormData)
        : JSON.stringify(options.body as JsonValue)
      : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    let code: string | undefined;
    let message = `Request failed with status ${res.status}`;
    let details: unknown;
    let correlationId: string | undefined;

    try {
      const data = (await res.json()) as unknown;
      if (data && typeof data === "object" && "error" in data) {
        const errorData = data as {
          error: {
            code?: string;
            message?: string;
            details?: unknown;
            correlationId?: string;
          };
        };
        code = errorData.error.code;
        message = errorData.error.message || message;
        details = errorData.error.details;
        correlationId = errorData.error.correlationId;
      }
    } catch {
      // ignore parse errors
    }
    const err = new ApiError({
      status: res.status,
      code,
      message,
      details,
      correlationId,
    });
    // Emit a centralized console hint for easier support troubleshooting
    console.error("API error:", toUserMessage(err));
    throw err;
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.blob()) as T;
}
