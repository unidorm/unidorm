import { useLocation } from "react-router-dom";

import { CampusScene, StepArt } from "../../components/illustrations/Illustrations";
import { Confetti, Doodles, Mascot, MascotTip, Squiggle } from "../../components/illustrations/Mascot";
import { ButtonLink, Card, ErrorState, FormMessage, Icon, LoadingState, Pill, ProgressBar, StatCard } from "../../components/ui";
import { ROUTES } from "../../config/routes";
import { accommodationStages, howItWorks } from "../../data/student";
import { useApi } from "../../hooks/useApi";
import { usePageTitle } from "../../hooks/usePageTitle";
import { usePortalInfo } from "../../hooks/usePortalInfo";
import { api } from "../../services/api";
import type { Dashboard } from "../../types/api";
import { cx } from "../../utils/cx";
import { ROOM_TYPE_LABELS, SURVEY_STATE, currentStage, firstName, formatDate } from "../../utils/studentProgress";

/** The one next thing the student should do, with the matching button. */
function NextStep({ dashboard }: { dashboard: Dashboard }) {
  const { room_preference: room, survey } = dashboard;

  if (!room.room_type) {
    return (
      <ButtonLink to={ROUTES.student.accommodation} size="lg">
        Choose room type
        <Icon name="arrowRight" size={18} />
      </ButtonLink>
    );
  }
  if (survey.state === "not_started" || survey.state === "in_progress") {
    return (
      <ButtonLink to={ROUTES.student.survey} size="lg">
        {survey.state === "not_started" ? "Start questionnaire" : "Continue questionnaire"}
        <Icon name="arrowRight" size={18} />
      </ButtonLink>
    );
  }
  if (dashboard.matching.state === "matched") {
    return (
      <ButtonLink to={ROUTES.student.matchingResults} size="lg">
        Meet my roommates
        <Icon name="arrowRight" size={18} />
      </ButtonLink>
    );
  }
  return (
    <ButtonLink to={ROUTES.student.accommodation} size="lg" variant="secondary">
      View my application
    </ButtonLink>
  );
}

function QuestionnaireCard({ dashboard }: { dashboard: Dashboard }) {
  const { survey, room_preference: room } = dashboard;
  const state = SURVEY_STATE[survey.state];

  let body;
  if (!room.room_type) {
    body = (
      <MascotTip mood="wave">Hi! First tell me which room you want. Shared rooms need the questionnaire.</MascotTip>
    );
  } else if (survey.state === "not_needed") {
    body = (
      <FormMessage tone="success">
        You asked for a single room, so you do not need the questionnaire. The Housing Office will review your
        application.
      </FormMessage>
    );
  } else if (survey.state === "submitted") {
    body = (
      <>
        <FormMessage tone="success">
          {dashboard.matching.state === "matched"
            ? `Your room was approved on ${formatDate(dashboard.matching.approved_at)}. See who you live with and how well you match.`
            : `Questionnaire submitted on ${formatDate(survey.submitted_at)}. The housing manager will use it to find your roommates.`}
        </FormMessage>
        <div className="mt-3 flex flex-wrap gap-2">
          {dashboard.matching.state === "matched" && (
            <ButtonLink to={ROUTES.student.matchingResults}>See matching results</ButtonLink>
          )}
          <ButtonLink to={ROUTES.student.surveyReview} variant="outline">
            See my answers
          </ButtonLink>
        </div>
      </>
    );
  } else {
    body = (
      <>
        <ProgressBar
          label="Answered"
          valueLabel={`${survey.answered} of ${survey.total} questions`}
          value={survey.answered}
          max={survey.total}
        />
        <MascotTip mood={survey.state === "not_started" ? "wave" : "happy"} className="mt-4">
          {survey.state === "not_started"
            ? "Five short sections about your daily habits. About 3 minutes!"
            : `Nice, ${survey.answered} done! Your answers are saved, so continue where you stopped.`}
        </MascotTip>
        <ButtonLink to={ROUTES.student.survey} className="mt-4">
          {survey.state === "not_started" ? "Start questionnaire" : "Continue questionnaire"}
        </ButtonLink>
      </>
    );
  }

  return (
    <Card title="Habits questionnaire" actions={<Pill tone={state.tone}>{state.label}</Pill>}>
      <div className="flex gap-4">
        {survey.state === "submitted" && <Mascot mood="cheer" className="hidden size-20 shrink-0 sm:block" />}
        {survey.state === "not_needed" && <Mascot mood="sleepy" className="hidden size-20 shrink-0 sm:block" />}
        <div className="min-w-0 flex-1">{body}</div>
      </div>
    </Card>
  );
}

export default function StudentHomePage() {
  usePageTitle("Home");
  const location = useLocation();
  const flash = location.state as { welcome?: boolean; submitted?: boolean } | null;
  const { data: dashboard, error, loading, reload } = useApi(api.student.dashboard);
  const { announcements, keyDates } = usePortalInfo("student");

  if (loading && !dashboard) return <LoadingState label="Loading your dashboard…" />;
  if (error || !dashboard) return <ErrorState error={error} onRetry={reload} title="Could not load your dashboard" />;

  const { user, room_preference: room } = dashboard;
  const stage = currentStage(dashboard);

  return (
    <>
      {flash?.submitted && <Confetti className="fixed z-50" />}
      {flash?.submitted && (
        <div className="mb-6">
          <FormMessage tone="success">Your questionnaire was submitted. Thank you!</FormMessage>
        </div>
      )}
      {flash?.welcome && (
        <div className="mb-6">
          <FormMessage tone="success">Your account is ready. Start by choosing a room type.</FormMessage>
        </div>
      )}

      {/* Banner: greeting and the next step */}
      <section className="relative overflow-hidden rounded-card bg-surface-raised">
        <Doodles />
        <div className="relative grid items-center gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-10">
          <div className="min-w-0">
            <p className="eyebrow">KBTU student housing · Jastar City</p>
            <h1 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              Сәлем, <Squiggle>{firstName(user.full_name)}</Squiggle>!
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-text/80">
              Here you apply for a room in the Jastar City dormitory, find a roommate with similar habits and sign
              your roommate agreement.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <NextStep dashboard={dashboard} />
            </div>
          </div>
          <CampusScene className="w-full max-w-md justify-self-center" />
        </div>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard
          label="Student"
          value={user.full_name}
          footer={<span className="truncate text-sm text-muted">{user.email}</span>}
        />
        <StatCard
          label="Room type"
          value={room.room_type ? ROOM_TYPE_LABELS[room.room_type] : "Not chosen yet"}
          footer={
            room.room_type ? (
              <Pill tone="success">Saved {formatDate(room.updated_at)}</Pill>
            ) : (
              <Pill tone="neutral">Step 1 of 4</Pill>
            )
          }
        />
        <StatCard
          label="Questionnaire"
          value={
            dashboard.survey.state === "in_progress"
              ? `${dashboard.survey.answered} of ${dashboard.survey.total} answered`
              : SURVEY_STATE[dashboard.survey.state].label
          }
          footer={<Pill tone={SURVEY_STATE[dashboard.survey.state].tone}>{accommodationStages[stage].label}</Pill>}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <QuestionnaireCard dashboard={dashboard} />
        <Card title="Your account" description="Details from your UniDorm account.">
          <dl className="divide-y divide-border text-sm">
            <div className="flex justify-between gap-4 py-2.5 first:pt-0">
              <dt className="text-muted">Name</dt>
              <dd className="text-right font-medium">{user.full_name}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-muted">Email</dt>
              <dd className="min-w-0 truncate text-right font-medium">{user.email}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5 last:pb-0">
              <dt className="text-muted">Registered</dt>
              <dd className="text-right font-medium">{formatDate(user.created_at)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card className="mt-6" padding="lg" title="How it works" description="Four steps from your application to your room.">
        <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {accommodationStages.map((item, index) => {
            const step = howItWorks[index];
            const current = index === stage;
            return (
              <li
                key={item.id}
                aria-current={current ? "step" : undefined}
                className={cx(
                  "flex flex-col rounded-card p-4",
                  current ? "bg-highlight-soft ring-2 ring-highlight" : "bg-surface-sunken",
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="grid size-20 place-items-center rounded-full bg-surface">
                    <StepArt step={step.art} className="size-16" />
                  </span>
                  <span className="font-display text-sm font-semibold text-muted">
                    {index < stage ? (
                      <span className="inline-flex items-center gap-1 text-success">
                        <Icon name="check" size={16} /> Done
                      </span>
                    ) : (
                      `Step ${index + 1}`
                    )}
                  </span>
                </div>
                <p className="mt-3 font-display font-semibold">{item.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{step.text}</p>
                {current && <p className="mt-3 text-xs font-semibold text-warning">You are here</p>}
              </li>
            );
          })}
        </ol>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card title="Announcements" description="News from the Housing Office.">
          <ul className="divide-y divide-border">
            {announcements.map((item) => (
              <li key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-highlight" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{item.body}</p>
                  <p className="mt-1.5 text-xs font-semibold text-accent">{item.period}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Key dates" description="The accommodation year at a glance.">
          <ol className="relative flex flex-col gap-4 border-l-2 border-border pl-5">
            {keyDates.map((date) => (
              <li key={date.id} className="relative">
                <span
                  className="absolute -left-[1.6rem] top-1 grid size-4 place-items-center rounded-full bg-surface ring-2 ring-accent"
                  aria-hidden="true"
                />
                <p className="text-xs font-semibold text-accent">{date.when}</p>
                <p className="text-sm font-semibold">{date.title}</p>
                <p className="text-sm text-muted">{date.note}</p>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  );
}
