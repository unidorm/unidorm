import LaterNotice from "../../components/layout/LaterNotice";
import PageHeader from "../../components/layout/PageHeader";
import { Button, Card, Pill } from "../../components/ui";
import { feedbackRounds } from "../../data/manager";

export default function FeedbackPage() {
  return (
    <>
      <PageHeader
        eyebrow="Housing Office · Jastar City"
        title="Feedback surveys"
        description="Student feedback on shared rooms, collected in two rounds."
      />
      <LaterNotice>
        Feedback surveys two weeks after move-in and at the end of the semester are planned for a later sprint.
      </LaterNotice>

      <div className="grid gap-4 md:grid-cols-2">
        {feedbackRounds.map((round) => (
          <Card
            key={round.id}
            variant="sunken"
            className="border-dashed"
            eyebrow={round.timing}
            title={round.title}
            description={round.description}
          >
            <div className="flex items-center justify-between gap-3">
              <Pill tone="neutral">Not started</Pill>
              <Button variant="outline" size="sm" disabled>
                View results
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
