import type { Tone } from "./ui";

/** Sample profile shown in the header. Replaced by the authenticated user in a later stage. */
export interface SampleUser {
  fullName: string;
  initials: string;
  /** Role of the user ("Student", "Housing Manager"). */
  role: string;
  /** Position or unit shown under the name. */
  position: string;
  email: string;
}

export interface StatusLabel {
  label: string;
  tone: Tone;
}

export interface Stage {
  id: string;
  label: string;
}

export interface RoomTypeOption {
  id: string;
  capacity: number;
  title: string;
  note: string;
}

export interface SurveyCategory {
  id: string;
  label: string;
  /** Weight in percent. The five weights add up to 100. */
  weight: number;
  questions: number;
}

export interface DocumentItem {
  id: string;
  title: string;
  description: string;
  status: StatusLabel;
}

export interface HelpTopic {
  id: string;
  title: string;
  description: string;
}

export type ScoreBand = "high" | "medium" | "low";

export interface RoomGroup {
  id: string;
  roomNumber: string;
  proposed: boolean;
  capacity: number;
  students: string[];
  /** Shown instead of the student names when the group is not complete yet. */
  studentsNote?: string;
  /** Placeholder score. The real score comes from the scoring stage. */
  score: number | null;
  band: ScoreBand | null;
  weakestArea: string | null;
  redFlags: number;
}

export interface OverviewFigure {
  id: string;
  label: string;
  value: number;
  tone: Tone;
}

export interface RoomTypeCoverage {
  id: string;
  label: string;
  scored: number;
  total: number;
}

export interface PendingReview {
  id: string;
  title: string;
  detail: string;
  status: StatusLabel;
}

export interface FeedbackRound {
  id: string;
  title: string;
  timing: string;
  description: string;
}
