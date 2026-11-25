import type { AnswerRow, CategoryScore } from "../../types/api";
import { cx } from "../../utils/cx";
import { Pill } from "../ui";
import type { Tone } from "../../types/ui";

const DIFFERENCE: Record<number, { label: string; tone: Tone }> = {
  0: { label: "Same", tone: "success" },
  1: { label: "Close", tone: "accent" },
  2: { label: "Different", tone: "warning" },
  3: { label: "Opposite", tone: "danger" },
};

interface AnswerComparisonProps {
  answers: AnswerRow[];
  categories: CategoryScore[];
  label1: string;
  label2: string;
}

/** Both students' real answers side by side, by category, with how far apart they are. */
export default function AnswerComparison({ answers, categories, label1, label2 }: AnswerComparisonProps) {
  return (
    <div className="flex flex-col gap-6">
      {categories.map((category) => {
        const rows = answers.filter((row) => row.category === category.category);
        return (
          <section key={category.category} aria-label={category.title}>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <h4 className="font-display font-semibold">{category.title}</h4>
              <span className="text-sm tabular-nums text-muted">{category.score}% match</span>
            </div>
            <div className="overflow-hidden rounded-card bg-surface-sunken">
              <div className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1.3fr)_minmax(0,1.3fr)_6.5rem] gap-4 px-4 pt-3 text-xs font-semibold text-muted md:grid">
                <span>Question</span>
                <span>{label1}</span>
                <span>{label2}</span>
                <span className="text-right">Difference</span>
              </div>
              <ul className="divide-y divide-border">
                {rows.map((row) => {
                  const difference = row.steps_apart === null ? null : DIFFERENCE[row.steps_apart];
                  return (
                    <li
                      key={row.code}
                      className="grid gap-x-4 gap-y-1.5 px-4 py-3 text-sm md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.3fr)_minmax(0,1.3fr)_6.5rem] md:items-center"
                    >
                      <span className="text-muted">
                        <span className="mr-1.5 font-semibold text-accent">{row.code}</span>
                        {row.question}
                      </span>
                      <Answer who={label1} value={row.answer_1} highlight={row.steps_apart !== 0} />
                      <Answer who={label2} value={row.answer_2} highlight={row.steps_apart !== 0} />
                      <span className="md:text-right">
                        {difference ? (
                          <Pill tone={difference.tone}>{difference.label}</Pill>
                        ) : (
                          <Pill tone="danger">Missing</Pill>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Answer({ who, value, highlight }: { who: string; value: string | null; highlight: boolean }) {
  return (
    <span className="flex gap-2 md:block">
      <span className="w-24 shrink-0 text-xs font-semibold text-muted md:hidden">{who}</span>
      <span className={cx(value ? "font-medium" : "italic text-danger", highlight && value && "text-text")}>
        {value ?? "Not answered"}
      </span>
    </span>
  );
}
