import type { ReactNode } from "react";

import { cx } from "../../utils/cx";
import type { Tone } from "../../types/ui";

const tones: Record<Tone, string> = {
  neutral: "border-border-strong text-muted",
  accent: "border-accent/70 text-accent",
  success: "border-success/70 text-success",
  warning: "border-warning/70 text-warning",
  danger: "border-danger/70 text-danger",
};

export interface PillProps {
  tone?: Tone;
  /** Small caps style, used for LATER / MODULE / SAMPLE DATA markers. */
  caps?: boolean;
  /** Dashed border, used for "sample data" markers. */
  dashed?: boolean;
  className?: string;
  children: ReactNode;
}

export default function Pill({ tone = "neutral", caps = false, dashed = false, className, children }: PillProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center whitespace-nowrap border font-medium",
        caps
          ? "rounded-md px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wider"
          : "rounded-full px-3 py-1 text-xs",
        dashed ? "border-dashed" : "border-solid",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
