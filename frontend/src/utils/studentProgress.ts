import type { Dashboard, RoomType, SurveyCategory, SurveyState } from "../types/api";
import type { Tone } from "../types/ui";

/** Display names for the room_type values the backend uses. */
export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  single: "Single room",
  double: "2-person room",
  triple: "3-person room",
  quad: "4-person room",
};

export const SURVEY_STATE: Record<SurveyState, { label: string; tone: Tone }> = {
  not_needed: { label: "Not needed", tone: "success" },
  not_started: { label: "Not started", tone: "neutral" },
  in_progress: { label: "In progress", tone: "warning" },
  submitted: { label: "Submitted", tone: "success" },
};

/**
 * Index into the four accommodation stages (room type, habits survey, manager review, room & agreement),
 * worked out from what the student has done so far.
 */
export function currentStage(dashboard: Dashboard): number {
  if (!dashboard.room_preference.room_type) return 0;
  if (dashboard.matching.state === "matched") return 3;
  if (dashboard.survey.state === "not_needed" || dashboard.survey.state === "submitted") return 2;
  return 1;
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

const DOODLES = ["sleep", "noise", "cleanliness", "visitors", "study"] as const;
export type DoodleCategory = (typeof DOODLES)[number];

/** The illustrated categories have a doodle; a category added later simply shows none. */
export function doodleFor(category: Pick<SurveyCategory, "id">): DoodleCategory | null {
  return (DOODLES as readonly string[]).includes(category.id) ? (category.id as DoodleCategory) : null;
}
