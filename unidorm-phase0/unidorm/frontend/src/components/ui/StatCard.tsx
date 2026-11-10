import type { ReactNode } from "react";

import { cx } from "../../utils/cx";
import type { Tone } from "../../types/ui";

const valueColors: Record<Tone, string> = {
  neutral: "text-text",
  accent: "text-accent",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

export interface StatCardProps {
  label: string;
  value: ReactNode;
  /** Colour of the value. */
  tone?: Tone;
  /** Extra content under the value, for example a Pill. */
  footer?: ReactNode;
  /** `lg` is a large numeric figure, `md` suits short text values. */
  size?: "md" | "lg";
  className?: string;
}

export default function StatCard({ label, value, tone = "neutral", footer, size = "md", className }: StatCardProps) {
  return (
    <div className={cx("flex flex-col gap-2 rounded-card border border-border bg-surface p-5", className)}>
      <p className="text-sm text-muted">{label}</p>
      <p
        className={cx(
          "font-display font-semibold leading-tight",
          size === "lg" ? "text-4xl tabular-nums" : "text-xl",
          valueColors[tone],
        )}
      >
        {value}
      </p>
      {footer && <div className="mt-1">{footer}</div>}
    </div>
  );
}
