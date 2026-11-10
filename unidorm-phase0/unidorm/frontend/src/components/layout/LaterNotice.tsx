import { Pill } from "../ui";

export interface LaterNoticeProps {
  children: string;
}

/** Banner for sections marked LATER in the prototype, so they never look finished. */
export default function LaterNotice({ children }: LaterNoticeProps) {
  return (
    <div
      role="note"
      className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-card border border-dashed border-border-strong bg-surface-sunken px-5 py-4"
    >
      <Pill caps tone="neutral">
        Later
      </Pill>
      <p className="min-w-0 flex-1 text-sm leading-relaxed text-muted">
        <span className="font-medium text-text">Planned for a later sprint. </span>
        {children}
      </p>
    </div>
  );
}
