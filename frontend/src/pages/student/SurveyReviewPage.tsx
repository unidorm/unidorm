import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { CategoryDoodle } from "../../components/illustrations/Illustrations";
import { MascotTip } from "../../components/illustrations/Mascot";
import PageHeader from "../../components/layout/PageHeader";
import SurveyGate from "../../components/survey/SurveyGate";
import { Button, ButtonLink, Card, ErrorState, FormMessage, Icon, LoadingState, Pill } from "../../components/ui";
import { ROUTES } from "../../config/routes";
import { useAuth } from "../../context/AuthContext";
import { surveyDraftKey, useSurveyData } from "../../hooks/useSurveyData";
import { api } from "../../services/api";
import { ApiError, errorMessage } from "../../services/apiClient";
import { doodleFor, formatDate } from "../../utils/studentProgress";

/** Summary of every answer before the final submit; read-only once submitted. */
export default function SurveyReviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, error, loading, reload } = useSurveyData();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [missing, setMissing] = useState<Set<number>>(new Set());

  if (loading && !data) return <LoadingState label="Loading your answers…" />;
  if (error || !data || !user) return <ErrorState error={error} onRetry={reload} title="Could not load your answers" />;

  const { structure, response } = data;
  const submitted = response.status === "submitted";
  const questions = structure.categories.flatMap((category) => category.questions);
  const unanswered = questions.filter((question) => question.is_required && !(response.answers[question.id]?.length));

  const onSubmit = async () => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      await api.survey.submit();
      try {
        window.localStorage.removeItem(surveyDraftKey(user.id));
      } catch {
        // Nothing to clean up if storage is blocked.
      }
      navigate(ROUTES.student.home, { state: { submitted: true } });
    } catch (reason) {
      setSubmitting(false);
      if (reason instanceof ApiError && Array.isArray(reason.body.missing_question_ids)) {
        setMissing(new Set(reason.body.missing_question_ids as number[]));
      }
      setSubmitError(errorMessage(reason));
      // The server may know more than this page (for example a submit from another tab).
      reload();
    }
  };

  let number = 0;

  return (
    <>
      <PageHeader
        eyebrow="Roommate matching · Habits questionnaire"
        title={submitted ? "Your submitted answers" : "Check your answers"}
        description={
          submitted
            ? "These answers are used to find your roommates. They cannot be changed any more."
            : "Look through your answers. You can still change any of them before you submit."
        }
        actions={submitted ? <Pill tone="success">Submitted {formatDate(response.submitted_at)}</Pill> : undefined}
      />

      <SurveyGate dashboard={data.dashboard}>
        <div className="flex flex-col gap-4">
          <MascotTip mood={submitted ? "cheer" : unanswered.length > 0 ? "think" : "happy"}>
            {submitted
              ? "All done! Your answers are with the Housing Office now."
              : unanswered.length > 0
                ? "A few questions are still empty. Use Edit to finish them."
                : "Looks great! Check once more, then press Submit at the bottom."}
          </MascotTip>
          {structure.categories.map((category) => {
            const doodle = doodleFor(category);
            return (
              <Card
                key={category.id}
                title={
                  <span className="flex items-center gap-3">
                    {doodle && (
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-raised">
                        <CategoryDoodle category={doodle} className="size-7" />
                      </span>
                    )}
                    {category.title}
                  </span>
                }
                actions={
                  !submitted && (
                    <Link
                      to={`${ROUTES.student.survey}?section=${encodeURIComponent(category.id)}`}
                      className="inline-flex items-center gap-1 rounded-control px-2 py-1 text-sm font-semibold text-accent hover:bg-surface-raised"
                    >
                      Edit
                      <span className="sr-only"> {category.title}</span>
                    </Link>
                  )
                }
              >
                <dl className="divide-y divide-border">
                  {category.questions.map((question) => {
                    number += 1;
                    const chosen = response.answers[question.id] ?? [];
                    const labels = question.options.filter((option) => chosen.includes(option.id)).map((option) => option.label);
                    const flagged = missing.has(question.id) || (question.is_required && labels.length === 0);
                    return (
                      <div key={question.id} className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] sm:gap-6">
                        <dt className="text-sm text-muted">
                          <span className="mr-2 font-semibold text-accent">Q{number}</span>
                          {question.text}
                        </dt>
                        <dd className="text-sm font-medium">
                          {labels.length > 0 ? (
                            labels.join(", ")
                          ) : (
                            <span className={flagged ? "text-danger" : "text-muted"}>Not answered</span>
                          )}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </Card>
            );
          })}

          {submitted ? (
            <div className="flex flex-wrap items-center gap-3">
              <ButtonLink to={ROUTES.student.home}>Back to dashboard</ButtonLink>
            </div>
          ) : (
            <Card variant="raised">
              {unanswered.length > 0 ? (
                <FormMessage tone="info">
                  {unanswered.length === 1 ? "1 question is" : `${unanswered.length} questions are`} still unanswered.
                  Use Edit to finish them before you submit.
                </FormMessage>
              ) : (
                <p className="text-sm leading-relaxed text-muted">
                  After you submit, the questionnaire and your room type are locked and go to the Housing Office.
                </p>
              )}
              {submitError && (
                <div className="mt-4">
                  <FormMessage tone="danger">{submitError}</FormMessage>
                </div>
              )}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <ButtonLink to={ROUTES.student.survey} variant="secondary">
                  <Icon name="arrowLeft" size={18} />
                  Back to questions
                </ButtonLink>
                <Button onClick={onSubmit} loading={submitting} disabled={unanswered.length > 0}>
                  Submit questionnaire
                </Button>
              </div>
            </Card>
          )}
        </div>
      </SurveyGate>
    </>
  );
}
