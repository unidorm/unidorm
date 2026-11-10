import LaterNotice from "../../components/layout/LaterNotice";
import PageHeader from "../../components/layout/PageHeader";
import { Card, Pill, ProgressBar, StatCard } from "../../components/ui";
import { dashboardOverview, dashboardPendingReviews, dashboardRoomCoverage } from "../../data/manager";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Housing Office · Jastar City"
        title="Dashboard"
        description="An overview of room groups, survey progress and reviews that are waiting."
        sampleData
      />
      <LaterNotice>This is a preview with sample numbers. Real statistics are not calculated yet.</LaterNotice>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {dashboardOverview.map((figure) => (
          <StatCard
            key={figure.id}
            className="border-dashed"
            label={figure.label}
            value={figure.value}
            tone={figure.tone}
            size="lg"
          />
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="border-dashed" title="Room statistics" description="Room groups with a score, by room type.">
          <div className="flex flex-col gap-4">
            {dashboardRoomCoverage.map((row) => (
              <ProgressBar
                key={row.id}
                label={row.label}
                valueLabel={`${row.scored} of ${row.total} scored`}
                value={row.scored}
                max={row.total}
              />
            ))}
          </div>
        </Card>

        <Card className="border-dashed" title="Pending reviews" description="Groups that need your attention.">
          <ul className="divide-y divide-border">
            {dashboardPendingReviews.map((review) => (
              <li key={review.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{review.title}</p>
                  <p className="mt-0.5 text-sm text-muted">{review.detail}</p>
                </div>
                <Pill tone={review.status.tone}>{review.status.label}</Pill>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
