import { useState } from "react";

import type { GroupDetail } from "../../types/api";
import { Card, FormMessage } from "../ui";
import PairView from "./PairView";
import RoomScoreSummary from "./RoomScoreSummary";

/** Manager view of 2-4 students: the room score, then any pair in full (click a pair to switch). */
export default function GroupDetailView({ detail }: { detail: GroupDetail }) {
  // Start with the weakest pair: that is the one worth checking first.
  const weakest = detail.pairs.findIndex(
    (pair) =>
      pair.student_1.id === detail.worst_pair_students[0]?.id && pair.student_2.id === detail.worst_pair_students[1]?.id,
  );
  const [selected, setSelected] = useState(Math.max(0, weakest));
  const pair = detail.pairs[selected];

  return (
    <div className="flex flex-col gap-6">
      {!detail.complete && (
        <FormMessage tone="danger">
          Some answers are missing, so some scores are lower than they would be. Missing answers are never counted as a match.
        </FormMessage>
      )}
      <Card
        title={detail.members.length === 2 ? "Pair score" : "Room score"}
        description={
          detail.members.length === 2
            ? undefined
            : `${detail.pairs.length} pairs. Click a pair to see it in detail below.`
        }
      >
        <RoomScoreSummary
          group={detail}
          onSelectPair={detail.pairs.length > 1 ? setSelected : undefined}
          selectedPair={detail.pairs.length > 1 ? selected : undefined}
        />
      </Card>
      {pair && <PairView key={`${pair.student_1.id}-${pair.student_2.id}`} pair={pair} />}
    </div>
  );
}
