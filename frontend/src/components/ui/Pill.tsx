import type { ReactNode } from "react";

import { cx } from "../../utils/cx";
import type { Tone } from "../../types/ui";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-raised text-muted",
  accent: "bg-accent/10 text-accent",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/10 text-danger",
};

export interface PillProps {
  tone?: Tone;
  /** Small compact style, used for "later" / "new" / "sample data" markers. */
  caps?: boolean;
  /** Dashed outline, used only for the "sample data" marker. */
  dashed?: boolean;
  className?: string;
  children: ReactNode;
}

export default function Pill({ tone = "neutral", caps = false, dashed = false, className, children }: PillProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center whitespace-nowrap font-medium",
        caps ? "rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold" : "rounded-full px-2.5 py-0.5 text-xs",
        dashed && "border border-dashed border-current",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
