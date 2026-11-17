import { DocumentArt, PALETTE } from "../../components/illustrations/Illustrations";
import PageHeader from "../../components/layout/PageHeader";
import { Button, Callout, Card, Pill } from "../../components/ui";
import type { Tone } from "../../types/ui";

const cornerColors: Record<Tone, string> = {
  neutral: PALETTE.sky,
  accent: PALETTE.blue,
  success: PALETTE.mint,
  warning: PALETTE.sun,
  danger: PALETTE.coral,
};
import { documents } from "../../data/student";

export default function DocumentsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Documents"
        title="Your documents"
        description="Accommodation documents and agreements, with their current status."
        sampleData
      />

      <Card padding="none">
        <ul className="divide-y divide-border">
          {documents.map((document) => (
            <li key={document.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 p-5">
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-surface-raised">
                <DocumentArt color={cornerColors[document.status.tone]} className="size-10" />
              </span>
              <div className="min-w-0 flex-1 basis-56">
                <p className="font-semibold">{document.title}</p>
                <p className="mt-0.5 text-sm text-muted">{document.description}</p>
              </div>
              <Pill tone={document.status.tone}>{document.status.label}</Pill>
              <Button variant="outline" size="sm" disabled>
                Open
              </Button>
            </li>
          ))}
        </ul>
      </Card>

      <Callout className="mt-5">
        Document statuses are placeholders. Opening, editing and signing the roommate agreement arrive in later
        stages.
      </Callout>
    </>
  );
}
