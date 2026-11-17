import { EmptyBox } from "../../components/illustrations/Illustrations";
import LaterNotice from "../../components/layout/LaterNotice";
import PageHeader from "../../components/layout/PageHeader";
import { Card } from "../../components/ui";
import { relocationColumns } from "../../data/manager";

export default function RelocationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Housing Office · Jastar City"
        title="Relocation requests"
        description="Requests from students who want to move to another room."
      />
      <LaterNotice>Relocation requests are planned for a later sprint. There is nothing to review yet.</LaterNotice>

      <Card variant="sunken" padding="none" className="overflow-hidden">
        <div className="hidden grid-cols-4 gap-4 border-b border-border px-5 py-4 text-sm font-semibold text-muted sm:grid">
          {relocationColumns.map((column) => (
            <span key={column}>{column}</span>
          ))}
        </div>
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <EmptyBox className="w-36" />
          <p className="font-semibold">No relocation requests</p>
          <p className="max-w-sm text-sm text-muted">
            When students can ask to move, their requests will be listed here for review.
          </p>
        </div>
      </Card>
    </>
  );
}
