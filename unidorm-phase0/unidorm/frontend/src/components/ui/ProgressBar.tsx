import { cx } from "../../utils/cx";
import type { Tone } from "../../types/ui";

const fills: Record<Tone, string> = {
  neutral: "bg-muted",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export interface ProgressBarProps {
  /** Current value, 0 to `max`. Values outside the range are clamped. */
  value: number;
  max?: number;
  label?: string;
  /** Show the percentage on the right of the label row. */
  showValue?: boolean;
  /** Text shown instead of the percentage, for example "3 of 15". */
  valueLabel?: string;
  tone?: Tone;
  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  valueLabel,
  tone = "accent",
  className,
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const rounded = Math.round(percent);

  return (
    <div className={cx("w-full", className)}>
      {(label || showValue || valueLabel) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
          <span className="text-text">{label}</span>
          {(valueLabel || showValue) && (
            <span className="tabular-nums text-muted">{valueLabel ?? `${rounded}%`}</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.min(max, Math.max(0, value))}
        className="h-2 w-full overflow-hidden rounded-full bg-surface-raised"
      >
        <div className={cx("h-full rounded-full", fills[tone])} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
