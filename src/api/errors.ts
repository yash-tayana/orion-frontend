export type ApiErrorShape = {
  status: number;
  code?: string;
  message: string;
  details?: unknown;
  correlationId?: string;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  correlationId?: string;

  constructor(err: ApiErrorShape) {
    super(err.message);
    this.name = "ApiError";
    this.status = err.status;
    this.code = err.code;
    this.details = err.details;
    this.correlationId = err.correlationId;
  }
}

export function toUserMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const cid = error.correlationId ? ` (ref: ${error.correlationId})` : "";
    return error.message + cid;
  }
  if (error instanceof Error) return error.message;
  return "Unexpected error";
}
