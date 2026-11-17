import type { ReactNode } from "react";

import { ROUTES } from "../../config/routes";
import type { Dashboard } from "../../types/api";
import { Mascot } from "../illustrations/Mascot";
import { ButtonLink } from "../ui";

/**
 * Explains why the questionnaire cannot be filled in (no room type yet, or a single room)
 * and links to the right place. Renders its children when the questionnaire is open.
 */
export default function SurveyGate({ dashboard, children }: { dashboard: Dashboard; children: ReactNode }) {
  const room = dashboard.room_preference.room_type;
  if (room && room !== "single") return <>{children}</>;

  const single = room === "single";
  return (
    <div className="flex flex-col items-center gap-4 rounded-card bg-surface px-6 py-12 text-center">
      <Mascot mood={single ? "sleepy" : "think"} className="size-28" />
      <h2 className="font-display text-xl font-semibold">
        {single ? "No questionnaire for single rooms" : "Choose a room type first"}
      </h2>
      <p className="max-w-md text-sm leading-relaxed text-muted">
        {single
          ? "You asked to live alone, so there is no roommate to match. Switch to a shared room if you want to fill in the questionnaire."
          : "The habits questionnaire is for students who share a room. Tell us which room type you want first."}
      </p>
      <ButtonLink to={ROUTES.student.accommodation}>{single ? "Change room type" : "Choose room type"}</ButtonLink>
    </div>
  );
}
