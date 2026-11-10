import type { ReactNode } from "react";

import PageHeader from "../../components/layout/PageHeader";
import { Button, ButtonLink, Callout, Card, Pill, Stepper } from "../../components/ui";
import { ROUTES } from "../../config/routes";
import {
  accommodationStages,
  currentStageIndex,
  dormRulesNote,
  roomTypeOptions,
  studentOverview,
} from "../../data/student";

function DetailRows({ rows }: { rows: Array<{ label: string; value: ReactNode }> }) {
  return (
    <dl className="divide-y divide-border">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
          <dt className="text-sm text-muted">{row.label}</dt>
          <dd className="text-right text-sm font-medium">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function AccommodationPage() {
  const overview = studentOverview;

  return (
    <>
      <PageHeader
        eyebrow={`Accommodation · ${overview.building}`}
        title="Your accommodation"
        description="See where your application stands and which room types you can ask for."
        sampleData
      />

      <Stepper steps={accommodationStages} currentIndex={currentStageIndex} className="mb-8" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Application" description="Your accommodation application for this academic year.">
          <DetailRows
            rows={[
              { label: "Building", value: overview.building },
              { label: "Academic year", value: overview.academicYear },
              {
                label: "Status",
                value: <Pill tone={overview.applicationStatus.tone}>{overview.applicationStatus.label}</Pill>,
              },
            ]}
          />
        </Card>
        <Card title="Room type" description="What you have asked for so far.">
          <DetailRows
            rows={[
              { label: "Requested room type", value: overview.roomType.value },
              {
                label: "Current stage",
                value: `${currentStageIndex + 1} of ${accommodationStages.length} · ${accommodationStages[currentStageIndex].label}`,
              },
              { label: "Next step", value: "Choose a room type" },
            ]}
          />
        </Card>
      </div>

      <Card
        className="mt-4"
        title="What kind of room do you want?"
        description="Room types available in Jastar City."
      >
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {roomTypeOptions.map((option) => (
            <li key={option.id} className="rounded-card border border-border bg-surface-sunken p-5">
              <p className="font-display text-3xl font-bold text-accent">{option.capacity}</p>
              <p className="mt-3 font-semibold">{option.title}</p>
              <p className="mt-1 text-sm text-muted">{option.note}</p>
            </li>
          ))}
        </ul>
        <Callout className="mt-5">{dormRulesNote}</Callout>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <ButtonLink to={ROUTES.student.home} variant="outline">
            Back
          </ButtonLink>
          <Button disabled>Continue to survey</Button>
          <p className="text-sm text-muted">Choosing a room type opens in the next stage.</p>
        </div>
      </Card>
    </>
  );
}
