import { useState } from "react";

import { EmptyBox, HelpBubbles } from "../../components/illustrations/Illustrations";
import PageHeader from "../../components/layout/PageHeader";
import { Card, Icon, Input } from "../../components/ui";
import { helpTopics } from "../../data/student";

export default function HelpPage() {
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const topics = helpTopics.filter(
    (topic) => !term || `${topic.title} ${topic.description}`.toLowerCase().includes(term),
  );

  return (
    <>
      <PageHeader
        eyebrow="Help"
        title="How can we help?"
        description="Short answers about accommodation, the habits survey and the roommate agreement."
      />

      <Input
        className="mb-6 max-w-md"
        label="Search help topics"
        placeholder="For example: survey, agreement"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        startAdornment={<Icon name="search" size={18} />}
      />

      {topics.length > 0 ? (
        <Card padding="none">
          <ul className="divide-y divide-border">
            {topics.map((topic, index) => (
              <li key={topic.id}>
                <details className="group px-5 py-4" open={index === 0 || Boolean(term)}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display font-semibold [&::-webkit-details-marker]:hidden">
                    {topic.title}
                    <Icon
                      name="chevronDown"
                      size={18}
                      className="shrink-0 text-muted transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{topic.description}</p>
                </details>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card variant="sunken" className="flex flex-col items-center gap-2 text-center">
          <EmptyBox className="w-28" />
          <p className="text-sm text-muted">No topics match “{query.trim()}”. Try another word.</p>
        </Card>
      )}

      <Card className="mt-6" variant="raised">
        <div className="flex flex-wrap items-center gap-5">
          <HelpBubbles className="w-28 shrink-0" />
          <div className="min-w-0 flex-1 basis-64">
            <p className="eyebrow">Still stuck?</p>
            <h2 className="mt-1 font-display text-lg font-semibold">Contact the Housing Office</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Contact details will be added by the Housing Office. For KBTU account problems, contact the KBTU IT
              help desk.
            </p>
          </div>
        </div>
      </Card>
    </>
  );
}
