import type { CompatibilityLevel } from "../../types/api";
import { cx } from "../../utils/cx";
import { LEVEL_TEXT } from "./levels";

interface ScoreRingProps {
  score: number;
  level: CompatibilityLevel;
  /** Small text under the number, e.g. "compatibility" or "room score". */
  caption?: string;
  size?: "md" | "lg";
  className?: string;
}

/** Circular progress with the score in the middle and the level under it. */
export default function ScoreRing({ score, level, caption = "compatibility", size = "lg", className }: ScoreRingProps) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.max(0, Math.min(100, score)) / 100) * circumference;
  const box = size === "lg" ? "size-44" : "size-28";

  return (
    <div className={cx("flex flex-col items-center gap-2", className)}>
      <div className={cx("relative", box)} role="img" aria-label={`${score}% ${caption}, ${level} compatibility`}>
        <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--color-surface-raised)" strokeWidth="12" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            className={cx(LEVEL_TEXT[level], "transition-[stroke-dasharray] duration-700")}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cx("font-display font-semibold tabular-nums", size === "lg" ? "text-4xl" : "text-2xl")}>
            {score}%
          </span>
          <span className="text-xs text-muted">{caption}</span>
        </div>
      </div>
      <span className={cx("font-display text-sm font-semibold", LEVEL_TEXT[level])}>{level} compatibility</span>
    </div>
  );
}
