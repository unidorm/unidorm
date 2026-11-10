import { cx } from "../../utils/cx";

export interface StepperStep {
  id: string;
  label: string;
}

export interface StepperProps {
  steps: StepperStep[];
  /** Zero-based index of the active step. Earlier steps are shown as done. */
  currentIndex: number;
  className?: string;
}

/** Segmented progress through named stages (the four accommodation stages in the prototype). */
export default function Stepper({ steps, currentIndex, className }: StepperProps) {
  return (
    <ol className={cx("grid gap-3", className)} style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((step, index) => {
        const reached = index <= currentIndex;
        const active = index === currentIndex;
        return (
          <li key={step.id} aria-current={active ? "step" : undefined}>
            <div className={cx("h-1 rounded-full", reached ? "bg-accent" : "bg-surface-raised")} />
            <p
              className={cx(
                "mt-2 text-xs sm:text-sm",
                active ? "font-semibold text-accent" : reached ? "text-text" : "text-muted",
              )}
            >
              {step.label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
