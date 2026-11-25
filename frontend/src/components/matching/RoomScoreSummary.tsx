import type { GroupResult } from "../../types/api";
import { cx } from "../../utils/cx";
import { Pill } from "../ui";
import { LEVEL_TONE } from "./levels";
import ScoreRing from "./ScoreRing";

interface RoomScoreSummaryProps {
  group: GroupResult;
  /** Highlights pairs that include this student (the student's own view). */
  highlightId?: number;
  /** Turns each pair into a button, e.g. to show that pair in detail. */
  onSelectPair?: (index: number) => void;
  selectedPair?: number;
}

/** Room score, the formula with the real numbers, and every pair score. */
export default function RoomScoreSummary({ group, highlightId, onSelectPair, selectedPair }: RoomScoreSummaryProps) {
  const worstKey = group.worst_pair_students.map((s) => s.id).join("-");
  const isPairRoom = group.members.length === 2;

  return (
    <div className="grid items-center gap-6 md:grid-cols-[auto_minmax(0,1fr)]">
      <ScoreRing score={group.room_score} level={group.compatibility_level} caption="room score" />
      <div className="min-w-0">
        {isPairRoom ? (
          <p className="text-sm leading-relaxed text-muted">
            In a room for two, the room score is the score of the one pair.
          </p>
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-3">
              <div className="rounded-card bg-surface-sunken p-3">
                <dt className="text-xs text-muted">Average of all pairs</dt>
                <dd className="font-display text-2xl font-semibold tabular-nums">{group.average_pairs}%</dd>
              </div>
              <div className="rounded-card bg-surface-sunken p-3">
                <dt className="text-xs text-muted">Weakest pair</dt>
                <dd className="font-display text-2xl font-semibold tabular-nums">{group.worst_pair}%</dd>
              </div>
            </dl>
            <p className="mt-3 rounded-control bg-highlight-soft px-3 py-2 text-sm">
              Room score = 0.6 × {group.average_pairs} + 0.4 × {group.worst_pair} = <b>{group.room_score}%</b>. The
              weakest pair counts extra, so one bad match lowers the whole room.
            </p>
          </>
        )}
        <ul className="mt-4 flex flex-col gap-2" aria-label="Pair scores">
          {group.pair_scores.map((pair, index) => {
            const key = `${pair.student_1.id}-${pair.student_2.id}`;
            const weakest = !isPairRoom && key === worstKey;
            const mine = highlightId !== undefined && [pair.student_1.id, pair.student_2.id].includes(highlightId);
            const content = (
              <>
                <span className="min-w-0 truncate">
                  {pair.student_1.full_name} <span className="text-muted">&</span> {pair.student_2.full_name}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {weakest && <span className="text-xs font-semibold text-danger">weakest</span>}
                  <Pill tone={LEVEL_TONE[pair.compatibility_level]}>{pair.overall_score}%</Pill>
                </span>
              </>
            );
            const style = cx(
              "flex w-full items-center justify-between gap-3 rounded-control px-3 py-2 text-left text-sm",
              selectedPair === index ? "bg-highlight-soft ring-2 ring-highlight" : "bg-surface-sunken",
              mine && selectedPair !== index && "ring-1 ring-accent/40",
            );
            return (
              <li key={key}>
                {onSelectPair ? (
                  <button type="button" onClick={() => onSelectPair(index)} className={cx(style, "hover:bg-surface-raised")} aria-pressed={selectedPair === index}>
                    {content}
                  </button>
                ) : (
                  <div className={style}>{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
