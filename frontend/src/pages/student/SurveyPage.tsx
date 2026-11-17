import { useCallback } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";

import PageHeader from "../../components/layout/PageHeader";
import Survey from "../../components/survey/Survey";
import SurveyGate from "../../components/survey/SurveyGate";
import { ErrorState, LoadingState } from "../../components/ui";
import { ROUTES } from "../../config/routes";
import { useAuth } from "../../context/AuthContext";
import { surveyDraftKey, useSurveyData } from "../../hooks/useSurveyData";
import { api } from "../../services/api";
import type { AnswerMap } from "../../types/api";

export default function SurveyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { data, error, loading, reload } = useSurveyData();

  const save = useCallback(async (answers: AnswerMap) => {
    await api.survey.saveAnswers(answers);
  }, []);

  // The current category lives in the URL (?section=noise), so a refresh opens the same one.
  const onCategoryChange = useCallback(
    (categoryId: string) => setParams({ section: categoryId }, { replace: true }),
    [setParams],
  );

  if (loading && !data) return <LoadingState label="Loading the questionnaire…" />;
  if (error || !data || !user) return <ErrorState error={error} onRetry={reload} title="Could not load the questionnaire" />;
  if (data.response.status === "submitted") return <Navigate to={ROUTES.student.surveyReview} replace />;

  return (
    <>
      <PageHeader
        eyebrow="Roommate matching · Habits questionnaire"
        title="Tell us how you live"
        description="There are no right or wrong answers. Answer how you really live: honest answers give you a better match."
      />
      <SurveyGate dashboard={data.dashboard}>
        <Survey
          structure={data.structure}
          initialAnswers={data.response.answers}
          initialCategoryId={params.get("section")}
          onCategoryChange={onCategoryChange}
          save={save}
          onComplete={() => navigate(ROUTES.student.surveyReview)}
          draftKey={surveyDraftKey(user.id)}
        />
      </SurveyGate>
    </>
  );
}
