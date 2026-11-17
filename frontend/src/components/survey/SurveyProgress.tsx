import type { SurveyCategory } from "../../types/api";
import { cx } from "../../utils/cx";
import { doodleFor } from "../../utils/studentProgress";
import { CategoryDoodle } from "../illustrations/Illustrations";
import { Icon, ProgressBar } from "../ui";

interface SurveyProgressProps {
  categories: SurveyCategory[];
  currentIndex: number;
  /** Answered question count per category id. */
  answeredByCategory: Record<string, number>;
  answeredTotal: number;
  totalQuestions: number;
  /** Jump to a category. Only categories up to the furthest reachable one are clickable. */
  onSelect: (index: number) => void;
  maxReachable: number;
}

/** Overall progress bar plus one step per category. */
export default function SurveyProgress({
  categories,
  currentIndex,
  answeredByCategory,
  answeredTotal,
  totalQuestions,
  onSelect,
  maxReachable,
}: SurveyProgressProps) {
  return (
    <nav aria-label="Questionnaire sections">
      <ProgressBar
        label={`Section ${currentIndex + 1} of ${categories.length}`}
        valueLabel={`${answeredTotal} of ${totalQuestions} answered`}
        value={answeredTotal}
        max={totalQuestions}
      />
      <ol className="mt-4 flex gap-2 overflow-x-auto pb-1 sm:grid sm:overflow-visible" style={{ gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))` }}>
        {categories.map((category, index) => {
          const done = (answeredByCategory[category.id] ?? 0) >= category.questions.length;
          const current = index === currentIndex;
          const doodle = doodleFor(category);
          return (
            <li key={category.id} className="min-w-[7.5rem] sm:min-w-0">
              <button
                type="button"
                onClick={() => onSelect(index)}
                disabled={index > maxReachable}
                aria-current={current ? "step" : undefined}
                className={cx(
                  "flex w-full items-center gap-2.5 rounded-control px-3 py-2.5 text-left text-sm transition-colors",
                  current ? "bg-highlight-soft ring-2 ring-highlight" : "bg-surface enabled:hover:bg-surface-raised",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-raised">
                  {done ? (
                    <Icon name="check" size={16} className="text-success" />
                  ) : doodle ? (
                    <CategoryDoodle category={doodle} className="size-6" />
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className={cx("block truncate", current && "font-semibold")}>{category.title}</span>
                  <span className="block text-xs text-muted">
                    {answeredByCategory[category.id] ?? 0}/{category.questions.length}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
