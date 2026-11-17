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
