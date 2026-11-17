import { useEffect, useState } from "react";

import { sampleAnnouncements, sampleKeyDates } from "../data/portal";
import { apiGet } from "../services/apiClient";
import type { Announcement, KeyDate } from "../types/domain";
import type { Portal } from "../types/navigation";

export interface PortalInfo {
  announcements: Announcement[];
  keyDates: KeyDate[];
  /** "api" when the data came from the backend, "sample" when the local copy is shown. */
  source: "api" | "sample";
}

const audienceFor: Record<Portal, "student" | "housing_manager"> = {
  student: "student",
  manager: "housing_manager",
};

function sampleFor(portal: Portal): PortalInfo {
  const audience = audienceFor[portal];
  return {
    announcements: sampleAnnouncements.filter((item) => item.audience === audience || item.audience === "all"),
    keyDates: sampleKeyDates,
    source: "sample",
  };
}

/** Announcements and key dates for a portal. Starts with the local copy, then uses the API if it answers. */
export function usePortalInfo(portal: Portal): PortalInfo {
  const [info, setInfo] = useState<PortalInfo>(() => sampleFor(portal));

  useEffect(() => {
    const controller = new AbortController();
    setInfo(sampleFor(portal));
    Promise.all([
      apiGet<Announcement[]>(`/api/portal/announcements?audience=${audienceFor[portal]}`, { signal: controller.signal }),
      apiGet<KeyDate[]>("/api/portal/key-dates", { signal: controller.signal }),
    ])
      .then(([announcements, keyDates]) => setInfo({ announcements, keyDates, source: "api" }))
      .catch(() => {
        // Backend not running: keep the local copy.
      });
    return () => controller.abort();
  }, [portal]);

  return info;
}
