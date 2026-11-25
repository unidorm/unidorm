import type { CompatibilityLevel } from "../../types/api";
import type { Tone } from "../../types/ui";

/** High 80-100, Medium 60-79, Low 0-59. The level always comes from the backend; this only picks colours. */
export const LEVEL_TONE: Record<CompatibilityLevel, Tone> = {
  High: "success",
  Medium: "warning",
  Low: "danger",
};

export const LEVEL_TEXT: Record<CompatibilityLevel, string> = {
  High: "text-success",
  Medium: "text-warning",
  Low: "text-danger",
};

/** Tone for a 0-100 score shown next to a level (category bars use the same thresholds). */
export function toneForScore(score: number): Tone {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "danger";
}

export const firstName = (fullName: string) => fullName.trim().split(/\s+/)[0] ?? fullName;
