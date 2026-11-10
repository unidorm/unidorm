import PageHeader from "../../components/layout/PageHeader";
import { ButtonLink, Card, Pill, ProgressBar, StatCard, Stepper } from "../../components/ui";
import { ROUTES } from "../../config/routes";
import {
  accommodationStages,
  currentStageIndex,
  studentOverview,
  surveyStatus,
} from "../../data/student";

export default function StudentHomePage() {
  const overview = studentOverview;
  const stage = accommodationStages[currentStageIndex];

  return (
    <>
      <PageHeader
        eyebrow={`Academic year ${overview.academicYear}`}
        title={`${overview.greeting}, ${overview.firstName}`}
        description="Follow your accommodation application and roommate matching in one place."
        sampleData
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Accommodation application"
          value={overview.building}
          footer={<Pill tone={overview.applicationStatus.tone}>{overview.applicationStatus.label}</Pill>}
        />
        <StatCard
          label="Room type"
          value={overview.roomType.value}
          footer={<Pill tone={overview.roomType.status.tone}>{overview.roomType.status.label}</Pill>}
        />
        <StatCard
          label="Roommate agreement"
          value={overview.agreement.value}
          footer={<Pill tone={overview.agreement.status.tone}>{overview.agreement.status.label}</Pill>}
        />
      </div>

      <Card variant="raised" padding="lg" className="mt-6">
        <p className="eyebrow mb-3">New in UniDorm</p>
        <h2 className="font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
          Find a roommate who lives like you
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
          If you ask for a shared room, answer {surveyStatus.total} short questions about sleep, noise, cleanliness,
          visitors and study. The housing manager uses your answers to put compatible students together.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <ButtonLink to={ROUTES.student.accommodation}>Choose room type</ButtonLink>
          <p className="text-sm text-muted">About {overview.surveyMinutes} minutes · KK / RU / EN</p>
        </div>
      </Card>

      <Card
        className="mt-6"
        title="Your progress"
        description={`Stage ${currentStageIndex + 1} of ${accommodationStages.length} · ${stage.label}`}
      >
        <Stepper steps={accommodationStages} currentIndex={currentStageIndex} />
        <ProgressBar
          className="mt-6"
          label="Habits survey"
          valueLabel={`${surveyStatus.answered} of ${surveyStatus.total} questions`}
          value={surveyStatus.answered}
          max={surveyStatus.total}
        />
      </Card>
    </>
  );
}
