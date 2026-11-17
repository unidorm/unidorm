import { UnderConstruction } from "../illustrations/Illustrations";

export interface LaterNoticeProps {
  children: string;
}

/** Banner for sections marked "later" in the prototype, so they never look finished. */
export default function LaterNotice({ children }: LaterNoticeProps) {
  return (
    <div role="note" className="mb-6 flex items-center gap-5 rounded-card bg-highlight-soft px-5 py-4">
      <UnderConstruction className="hidden w-24 shrink-0 sm:block" />
      <p className="min-w-0 flex-1 text-sm leading-relaxed text-text/80">
        <span className="block font-display text-base font-semibold text-text">Coming in a later sprint</span>
        {children}
      </p>
    </div>
  );
}
