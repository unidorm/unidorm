import type {
  AnswerMap,
  AuthResponse,
  Dashboard,
  RoomPreference,
  RoomType,
  SurveyResponse,
  SurveyStructure,
  User,
} from "../types/api";
import { apiRequest } from "./apiClient";

/** One function per backend endpoint, so pages never build URLs themselves. */
export const api = {
  auth: {
    register: (data: { full_name: string; email: string; password: string }) =>
      apiRequest<AuthResponse>("/api/auth/register", { method: "POST", body: data }),
    login: (data: { email: string; password: string }) =>
      apiRequest<AuthResponse>("/api/auth/login", { method: "POST", body: data }),
    logout: () => apiRequest<void>("/api/auth/logout", { method: "POST" }),
    me: (signal?: AbortSignal) => apiRequest<User>("/api/auth/me", { signal }),
  },
  student: {
    dashboard: (signal?: AbortSignal) => apiRequest<Dashboard>("/api/student/dashboard", { signal }),
    roomPreference: (signal?: AbortSignal) => apiRequest<RoomPreference>("/api/student/room-preference", { signal }),
    setRoomPreference: (roomType: RoomType) =>
      apiRequest<RoomPreference>("/api/student/room-preference", { method: "PUT", body: { room_type: roomType } }),
  },
  survey: {
    structure: (signal?: AbortSignal) => apiRequest<SurveyStructure>("/api/survey", { signal }),
    response: (signal?: AbortSignal) => apiRequest<SurveyResponse>("/api/survey/response", { signal }),
    /** Saves the given answers; an empty list clears that answer. */
    saveAnswers: (answers: AnswerMap) =>
      apiRequest<SurveyResponse>("/api/survey/response/answers", {
        method: "PUT",
        body: {
          answers: Object.entries(answers).map(([questionId, optionIds]) => ({
            question_id: Number(questionId),
            option_ids: optionIds,
          })),
        },
      }),
    submit: () => apiRequest<SurveyResponse>("/api/survey/response/submit", { method: "POST" }),
  },
};
