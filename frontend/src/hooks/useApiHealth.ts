import { useEffect, useState } from "react";

import { apiGet } from "../services/apiClient";

export type ApiStatus = "checking" | "online" | "offline";

/** How often the status is checked again, so it updates when the backend is started or stopped. */
const RECHECK_INTERVAL_MS = 30_000;

/** Checks GET /api/health on mount and every 30 seconds. Used for the small status line in the sidebar. */
export function useApiHealth(): ApiStatus {
  const [status, setStatus] = useState<ApiStatus>("checking");

  useEffect(() => {
    const controller = new AbortController();

    const check = () => {
      apiGet<{ status: string }>("/api/health", { signal: controller.signal, timeoutMs: 5_000 })
        .then(() => setStatus("online"))
        .catch(() => {
          // Unmounting aborts the request; that is not an "offline" result.
          if (!controller.signal.aborted) setStatus("offline");
        });
    };

    check();
    const timer = window.setInterval(check, RECHECK_INTERVAL_MS);
    return () => {
      window.clearInterval(timer);
      controller.abort();
    };
  }, []);

  return status;
}
