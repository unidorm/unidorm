import type {
  AnswerMap,
  AuthResponse,
  Dashboard,
  GroupDetail,
  MatchingOverview,
  RoommateGroupDetail,
  RoommateGroupSummary,
  StudentMatching,
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
    /** Phase 3: the student's approved room and compatibility with each roommate. */
    matching: (signal?: AbortSignal) => apiRequest<StudentMatching>("/api/student/matching", { signal }),
  },
  /** Phase 3, Housing Office only. All scores are calculated by the backend. */
  matching: {
    overview: (signal?: AbortSignal) => apiRequest<MatchingOverview>("/api/matching/overview", { signal }),
    run: () => apiRequest<MatchingOverview>("/api/matching/runs", { method: "POST", timeoutMs: 60000 }),
    compare: (userIds: number[]) =>
      apiRequest<GroupDetail>("/api/matching/compare", { method: "POST", body: { user_ids: userIds } }),
    group: (groupId: number, signal?: AbortSignal) =>
      apiRequest<RoommateGroupDetail>(`/api/matching/groups/${groupId}`, { signal }),
    approve: (groupId: number) =>
      apiRequest<RoommateGroupSummary>(`/api/matching/groups/${groupId}/approve`, { method: "POST" }),
    reject: (groupId: number) =>
      apiRequest<RoommateGroupSummary>(`/api/matching/groups/${groupId}/reject`, { method: "POST" }),
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
