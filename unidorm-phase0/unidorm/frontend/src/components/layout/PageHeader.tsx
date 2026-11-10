import type { ReactNode } from "react";

import { Pill } from "../ui";

export interface PageHeaderProps {
  /** Small uppercase label above the title. */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Marks the page as showing sample data (dashed pill, as in the prototype). */
  sampleData?: boolean;
  /** Extra content on the right of the title, for example a button. */
  actions?: ReactNode;
}

/** Title block used at the top of every page, so all pages share the same rhythm. */
export default function PageHeader({ eyebrow, title, description, sampleData = false, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
      <div className="min-w-0 max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 text-base leading-relaxed text-muted">{description}</p>}
      </div>
      {(sampleData || actions) && (
        <div className="flex items-center gap-3">
          {sampleData && (
            <Pill tone="warning" caps dashed>
              Sample data
            </Pill>
          )}
          {actions}
        </div>
      )}
    </header>
  );
}
