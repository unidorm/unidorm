import { useState } from "react";

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
        <ul className="grid gap-4 md:grid-cols-2">
          {topics.map((topic) => (
            <li key={topic.id}>
              <Card className="h-full" title={topic.title} description={topic.description} />
            </li>
          ))}
        </ul>
      ) : (
        <Card variant="sunken" className="border-dashed text-center">
          <p className="text-sm text-muted">No topics match “{query.trim()}”.</p>
        </Card>
      )}

      <Card
        className="mt-6"
        eyebrow="Still stuck?"
        title="Contact the Housing Office"
        description="Contact details will be added by the Housing Office. For KBTU account problems, contact the KBTU IT help desk."
      />
    </>
  );
}
