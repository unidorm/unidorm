import { CategoryDoodle } from "../illustrations/Illustrations";
import { ProgressBar } from "../ui";
import type { CategoryScore } from "../../types/api";
import { doodleFor } from "../../utils/studentProgress";
import { toneForScore } from "./levels";

/** The five category indicators, each with its weight and the rules behind its score. */
export default function CategoryScores({ categories }: { categories: CategoryScore[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {categories.map((item) => {
        const doodle = doodleFor({ id: item.category });
        return (
          <li key={item.category} className="rounded-card bg-surface-sunken p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface">
                {doodle && <CategoryDoodle category={doodle} className="size-7" />}
              </span>
              <div className="min-w-0 flex-1">
                <ProgressBar
                  label={`${item.title} · ${item.weight}% of the score`}
                  valueLabel={`${item.score}%`}
                  value={item.score}
                  tone={toneForScore(item.score)}
                />
              </div>
            </div>
            <details className="group mt-2 pl-13">
              <summary className="cursor-pointer list-none text-xs font-semibold text-accent hover:underline [&::-webkit-details-marker]:hidden">
                <span className="group-open:hidden">Why this score?</span>
                <span className="hidden group-open:inline">Hide details</span>
              </summary>
              <ul className="mt-2 flex flex-col gap-1.5 text-sm">
                {item.rules.map((rule) => (
                  <li key={rule.key} className="flex justify-between gap-4">
                    <span className="text-muted">
                      {rule.label} <span className="text-xs">({Math.round(rule.weight * 100)}%)</span>
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums">
                      {rule.missing ? <span className="text-danger">not answered</span> : `${rule.score}%`}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        );
      })}
    </ul>
  );
}
