import { api } from "../services/api";
import type { Dashboard, SurveyResponse, SurveyStructure } from "../types/api";
import { useApi } from "./useApi";

export interface SurveyData {
  dashboard: Dashboard;
  structure: SurveyStructure;
  response: SurveyResponse;
}

const loadSurveyData = async (signal: AbortSignal): Promise<SurveyData> => {
  const [dashboard, structure, response] = await Promise.all([
    api.student.dashboard(signal),
    api.survey.structure(signal),
    api.survey.response(signal),
  ]);
  return { dashboard, structure, response };
};

/** Everything the questionnaire pages need, loaded in parallel. */
export function useSurveyData() {
  return useApi(loadSurveyData);
}

/** localStorage key for a student's unsaved answers. */
export const surveyDraftKey = (userId: number) => `unidorm.survey-draft.${userId}`;
