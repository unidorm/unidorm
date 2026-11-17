import { CategoryDoodle, RoommatesScene } from "../../components/illustrations/Illustrations";
import { Doodles, Squiggle } from "../../components/illustrations/Mascot";
import { ButtonLink, Card, ErrorState, LoadingState, Pill, ProgressBar } from "../../components/ui";
import { ROUTES } from "../../config/routes";
import { surveyDataUse } from "../../data/student";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useSurveyData } from "../../hooks/useSurveyData";
import { SURVEY_STATE, doodleFor } from "../../utils/studentProgress";

export default function RoommateMatchingPage() {
  usePageTitle("Roommate matching");
  const { data, error, loading, reload } = useSurveyData();

  if (loading && !data) return <LoadingState label="Loading roommate matching…" />;
  if (error || !data) return <ErrorState error={error} onRetry={reload} title="Could not load roommate matching" />;

  const { structure, response, dashboard } = data;
  const state = dashboard.survey.state;
  const room = dashboard.room_preference.room_type;
  const answeredIn = (questionIds: number[]) => questionIds.filter((id) => (response.answers[id]?.length ?? 0) > 0).length;

  let action;
  if (!room) {
    action = <ButtonLink to={ROUTES.student.accommodation} size="lg">Choose room type first</ButtonLink>;
  } else if (state === "not_needed") {
    action = <p className="text-sm text-muted">You chose a single room, so you do not need the questionnaire.</p>;
  } else if (state === "submitted") {
    action = <ButtonLink to={ROUTES.student.surveyReview} size="lg" variant="secondary">See my answers</ButtonLink>;
  } else {
    action = (
      <ButtonLink to={ROUTES.student.survey} size="lg">
        {state === "not_started" ? "Start questionnaire" : "Continue questionnaire"}
      </ButtonLink>
    );
  }

  return (
    <>
      <section className="relative overflow-hidden rounded-card bg-surface-raised">
        <Doodles />
        <div className="relative grid items-center gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-10">
          <div className="min-w-0">
            <p className="eyebrow">Roommate matching · Habits questionnaire</p>
            <h1 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              Find a roommate who <Squiggle>lives like you</Squiggle>
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-text/80">
              {structure.total_questions} questions in {structure.categories.length} short sections, no right or wrong
              answers. Answer how you really live: honest answers give you a better match.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">{action}</div>
          </div>
          <RoommatesScene className="w-full max-w-sm justify-self-center" />
        </div>
      </section>

      <h2 className="mb-4 mt-8 font-display text-xl font-semibold">What the questionnaire asks about</h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-label="Questionnaire sections and their weight">
        {structure.categories.map((category) => {
          const doodle = doodleFor(category);
          return (
            <li key={category.id} className="flex flex-col rounded-card bg-surface p-5">
              <span className="grid size-14 place-items-center rounded-full bg-surface-raised">
                {doodle && <CategoryDoodle category={doodle} className="size-10" />}
              </span>
              <p className="mt-3 font-display font-semibold">{category.title}</p>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{category.description}</p>
              <p className="mt-3 text-xs text-muted">{category.questions.length} questions</p>
              <ProgressBar className="mt-2" label="Weight" valueLabel={`${category.weight}%`} value={category.weight} max={25} />
            </li>
          );
        })}
      </ul>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card title="How your answers are used">
          <ul className="flex flex-col gap-3">
            {surveyDataUse.map((line) => (
              <li key={line} className="flex gap-3 text-sm leading-relaxed text-muted">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card
          title="Your progress"
          actions={<Pill tone={SURVEY_STATE[state].tone}>{SURVEY_STATE[state].label}</Pill>}
          description="Answered questions in each section."
        >
          <ProgressBar
            label="Overall"
            valueLabel={`${response.answered} of ${response.total} questions`}
            value={response.answered}
            max={response.total}
          />
          <div className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {structure.categories.map((category) => {
              const answered = answeredIn(category.questions.map((question) => question.id));
              return (
                <ProgressBar
                  key={category.id}
                  label={category.title}
                  valueLabel={`${answered} of ${category.questions.length}`}
                  value={answered}
                  max={category.questions.length}
                />
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}
