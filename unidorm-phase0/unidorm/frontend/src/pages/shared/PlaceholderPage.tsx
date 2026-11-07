import { useEffect, useState } from "react";

import { apiGet } from "../../services/apiClient";

type ApiStatus = "checking" | "online" | "offline";

const statusText: Record<ApiStatus, string> = {
  checking: "Checking the API…",
  online: "API is online",
  offline: "API is not reachable. Start the backend on port 8000.",
};

const statusColor: Record<ApiStatus, string> = {
  checking: "text-muted",
  online: "text-success",
  offline: "text-danger",
};

export default function PlaceholderPage() {
  const [status, setStatus] = useState<ApiStatus>("checking");

  useEffect(() => {
    apiGet<{ status: string }>("/api/health")
      .then(() => setStatus("online"))
      .catch(() => setStatus("offline"));
  }, []);

  return (
    <main className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-4xl font-bold">UniDorm</h1>
      <p className="text-muted">Project setup is complete. Pages will be added in the next phases.</p>
      <p className={statusColor[status]}>{statusText[status]}</p>
    </main>
  );
}
