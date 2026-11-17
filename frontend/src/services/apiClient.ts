import { clearToken, getToken } from "./authStorage";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

/** How long a request may take before it is cancelled. */
const DEFAULT_TIMEOUT_MS = 10_000;

/** Error thrown for failed requests. `detail` is the backend message ({"detail": "..."}). */
export class ApiError extends Error {
  readonly status: number;
  readonly detail: string;
  /** The whole error body, for extra fields such as `missing_question_ids`. */
  readonly body: Record<string, unknown>;

  constructor(status: number, detail: string, body: Record<string, unknown> = {}) {
    super(`Request failed (${status}): ${detail}`);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.body = body;
  }
}

/** Called when the backend says the session is no longer valid (set by AuthProvider). */
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** Lets the caller cancel the request, for example when a component unmounts. */
  signal?: AbortSignal;
  timeoutMs?: number;
}

/** FastAPI sends {"detail": "text"} for our errors and {"detail": [{"msg": ...}]} for validation errors. */
function readDetail(body: Record<string, unknown>, fallback: string): string {
  const detail = body.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: unknown; loc?: unknown };
    if (typeof first.msg === "string") return first.msg.replace(/^Value error, /, "");
  }
  return fallback || "Something went wrong.";
}

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, signal, timeoutMs = DEFAULT_TIMEOUT_MS }: RequestOptions = {},
): Promise<T> {
  const timeout = AbortSignal.timeout(timeoutMs);
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });

  if (response.status === 204) return undefined as T;

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    // Not JSON (for example a proxy error page).
  }

  if (!response.ok) {
    const errorBody = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
    if (response.status === 401 && token) {
      clearToken();
      onUnauthorized?.();
    }
    throw new ApiError(response.status, readDetail(errorBody, response.statusText), errorBody);
  }
  return data as T;
}

export function apiGet<T>(path: string, options: Omit<RequestOptions, "method" | "body"> = {}): Promise<T> {
  return apiRequest<T>(path, options);
}

/** Text to show the user for any failed request. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 503) return "The server cannot reach the database right now. Please try again later.";
    return error.detail;
  }
  if (error instanceof DOMException && (error.name === "TimeoutError" || error.name === "AbortError")) {
    return "The server took too long to answer. Please try again.";
  }
  return "Cannot reach the UniDorm server. Check your connection and try again.";
}
