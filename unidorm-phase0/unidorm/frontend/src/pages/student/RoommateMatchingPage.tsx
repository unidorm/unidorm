import PageHeader from "../../components/layout/PageHeader";
import { Button, Card, Pill, ProgressBar } from "../../components/ui";
import {
  studentOverview,
  surveyCategories,
  surveyDataUse,
  surveyStatus,
} from "../../data/student";

export default function RoommateMatchingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Roommate matching"
        title="Find a roommate who lives like you"
        description="A short habits survey helps the housing manager put compatible students in the same room."
        sampleData
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card padding="lg">
          <p className="eyebrow mb-3">Before you start</p>
          <h2 className="font-display text-2xl font-bold leading-tight tracking-tight">
            {surveyStatus.total} questions, no right or wrong answers
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Answer how you really live, not how you think you should. Honest answers give you a better match.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Survey areas and their weight">
            {surveyCategories.map((category) => (
              <li key={category.id}>
                <Pill tone="accent">
                  {category.label} · {category.weight}%
                </Pill>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button disabled>Start survey</Button>
            <p className="text-sm text-muted">
              About {studentOverview.surveyMinutes} minutes · The survey opens in the next stage.
            </p>
          </div>
        </Card>

        <Card title="How your answers are used">
          <ul className="flex flex-col gap-3">
            {surveyDataUse.map((line) => (
              <li key={line} className="flex gap-3 text-sm leading-relaxed text-muted">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card
        className="mt-4"
        title="Survey status"
        actions={<Pill tone="neutral">{surveyStatus.label}</Pill>}
        description="Your progress through the five survey areas."
      >
        <ProgressBar
          label="Overall"
          valueLabel={`${surveyStatus.answered} of ${surveyStatus.total} questions`}
          value={surveyStatus.answered}
          max={surveyStatus.total}
        />
        <div className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {surveyCategories.map((category) => (
            <ProgressBar
              key={category.id}
              label={`${category.label} · ${category.weight}%`}
              valueLabel={`${surveyStatus.answeredByCategory[category.id] ?? 0} of ${category.questions}`}
              value={surveyStatus.answeredByCategory[category.id] ?? 0}
              max={category.questions}
            />
          ))}
        </div>
      </Card>
    </>
  );
}
