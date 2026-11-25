/** Shapes returned by the UniDorm API (backend/app/schemas). Keep in sync with the backend. */

export type UserRole = "student" | "housing_manager";
export type RoomType = "single" | "double" | "triple" | "quad";

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  room_preference: RoomType | null;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  token_type: "bearer";
  expires_at: string;
  user: User;
}

export interface RoomPreference {
  room_type: RoomType | null;
  updated_at: string | null;
  /** False once the questionnaire is submitted. */
  can_change: boolean;
}

export type SurveyState = "not_needed" | "not_started" | "in_progress" | "submitted";

export interface Dashboard {
  user: User;
  room_preference: RoomPreference;
  /** Phase 3: whether an approved room exists yet. */
  matching: { state: MatchingState; approved_at: string | null };
  survey: { state: SurveyState; answered: number; total: number; submitted_at: string | null };
}

export type AnswerType = "single_choice" | "multiple_choice";

export interface SurveyOption {
  id: number;
  label: string;
  value: number;
}

export interface SurveyQuestion {
  id: number;
  code: string;
  text: string;
  answer_type: AnswerType;
  is_required: boolean;
  options: SurveyOption[];
}

export interface SurveyCategory {
  id: string;
  title: string;
  description: string;
  weight: number;
  questions: SurveyQuestion[];
}

export interface SurveyStructure {
  categories: SurveyCategory[];
  total_questions: number;
}

/** Question id (as a string key in JSON) -> chosen option ids. */
export type AnswerMap = Record<string, number[]>;

export interface SurveyResponse {
  status: "draft" | "submitted" | null;
  answers: AnswerMap;
  answered: number;
  total: number;
  updated_at: string | null;
  submitted_at: string | null;
}

// --- Phase 3: matching -----------------------------------------------------------------------

export type CompatibilityLevel = "High" | "Medium" | "Low";
export type MatchingState = "not_needed" | "no_questionnaire" | "waiting" | "matched";
export type GroupStatus = "proposed" | "approved" | "rejected";

export interface StudentRef {
  id: number;
  full_name: string;
}

export interface RuleScore {
  key: string;
  label: string;
  weight: number;
  score: number;
  missing: boolean;
}

export interface CategoryScore {
  category: string;
  title: string;
  /** Percent of the overall score (25, 20, 20, 20, 15). */
  weight: number;
  score: number;
  rules: RuleScore[];
  missing_questions: string[];
}

export interface AnswerRow {
  code: string;
  category: string;
  question: string;
  answer_1: string | null;
  answer_2: string | null;
  steps_apart: number | null;
}

export interface PairResult {
  student_1: StudentRef;
  student_2: StudentRef;
  overall_score: number;
  compatibility_level: CompatibilityLevel;
  category_scores: Record<string, number>;
  categories: CategoryScore[];
  complete: boolean;
  missing_questions: string[];
  answers: AnswerRow[] | null;
}

export interface PairScore {
  student_1: StudentRef;
  student_2: StudentRef;
  overall_score: number;
  compatibility_level: CompatibilityLevel;
}

export interface GroupResult {
  members: StudentRef[];
  room_score: number;
  compatibility_level: CompatibilityLevel;
  average_pairs: number;
  worst_pair: number;
  worst_pair_students: StudentRef[];
  pair_scores: PairScore[];
  complete: boolean;
}

export interface GroupDetail extends GroupResult {
  pairs: PairResult[];
}

export interface RoommateGroup {
  id: number;
  run_id: number;
  room_type: RoomType;
  status: GroupStatus;
  created_at: string;
  decided_at: string | null;
  decided_by: string | null;
}

export interface RoommateGroupSummary extends RoommateGroup {
  result: GroupResult;
}

export type RoommateGroupDetail = RoommateGroup & GroupDetail;

export interface EligibleStudent {
  id: number;
  full_name: string;
  email: string;
  room_type: RoomType;
  submitted_at: string | null;
  match_status: "waiting" | "proposed" | "approved";
  group_id: number | null;
}

export interface MatchingOverview {
  students: EligibleStudent[];
  proposed: RoommateGroupSummary[];
  approved: RoommateGroupSummary[];
  last_run: {
    id: number;
    created_at: string;
    started_by: string | null;
    eligible_count: number;
    proposed_count: number;
  } | null;
  waiting_for_questionnaire: number;
}

export interface StudentMatching {
  state: MatchingState;
  room_type: RoomType | null;
  approved_at: string | null;
  group: GroupResult | null;
  /** The student compared with each roommate; the student is always student_1. */
  pairs: PairResult[];
}
