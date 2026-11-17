import type { ReactNode } from "react";

import { cx } from "../../utils/cx";

export interface CalloutProps {
  tone?: "neutral" | "warning";
  title?: string;
  className?: string;
  children: ReactNode;
}

/** Quiet note with a left rule, used for short explanations under content (as in the prototype). */
export default function Callout({ tone = "neutral", title, className, children }: CalloutProps) {
  return (
    <aside
      className={cx(
        "border-l-2 py-0.5 pl-4 text-sm leading-relaxed text-muted",
        tone === "warning" ? "border-warning/70" : "border-border-strong",
        className,
      )}
    >
      {title && <p className="mb-0.5 font-medium text-text">{title}</p>}
      {children}
    </aside>
  );
}
