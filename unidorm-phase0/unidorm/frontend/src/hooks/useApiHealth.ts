import { useEffect, useState } from "react";

import { apiGet } from "../services/apiClient";

export type ApiStatus = "checking" | "online" | "offline";

/** Checks GET /api/health once. Used for the small status line in the sidebar. */
export function useApiHealth(): ApiStatus {
  const [status, setStatus] = useState<ApiStatus>("checking");

  useEffect(() => {
    let cancelled = false;
    apiGet<{ status: string }>("/api/health")
      .then(() => !cancelled && setStatus("online"))
      .catch(() => !cancelled && setStatus("offline"));
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
