import { useState } from "react";

import { Mascot } from "../../components/illustrations/Mascot";
import PageHeader from "../../components/layout/PageHeader";
import { firstName } from "../../components/matching/levels";
import PairView from "../../components/matching/PairView";
import RoomScoreSummary from "../../components/matching/RoomScoreSummary";
import { ButtonLink, Card, ErrorState, LoadingState } from "../../components/ui";
import { ROUTES } from "../../config/routes";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi";
import { api } from "../../services/api";
import type { StudentMatching } from "../../types/api";
import { cx } from "../../utils/cx";
import { ROOM_TYPE_LABELS, formatDate } from "../../utils/studentProgress";

const NOT_READY: Record<Exclude<StudentMatching["state"], "matched">, { title: string; text: string; mood: "sleepy" | "think" | "happy" }> = {
  not_needed: {
    title: "No roommates for a single room",
    text: "You asked to live alone, so there is nothing to match.",
    mood: "sleepy",
  },
  no_questionnaire: {
    title: "Submit your questionnaire first",
    text: "Your roommates are chosen from your questionnaire answers. Finish and submit it, then the Housing Office can match you.",
    mood: "think",
  },
  waiting: {
    title: "The Housing Office is putting rooms together",
    text: "Your questionnaire is in. When a housing manager approves your room, you will see your roommates and how well you match here.",
    mood: "happy",
  },
};

export default function MatchingResultsPage() {
  const { user } = useAuth();
  const { data, error, loading, reload } = useApi(api.student.matching);
  const [selected, setSelected] = useState(0);

  if (loading && !data) return <LoadingState label="Loading your matching results…" />;
  if (error || !data || !user) return <ErrorState error={error} onRetry={reload} title="Could not load your results" />;

  if (data.state !== "matched" || !data.group) {
    const info = NOT_READY[data.state === "matched" ? "waiting" : data.state];
    return (
      <>
        <PageHeader eyebrow="Roommate matching · Results" title="Your matching results" />
        <div className="flex flex-col items-center gap-4 rounded-card bg-surface px-6 py-12 text-center">
          <Mascot mood={info.mood} className="size-28 animate-bob" />
          <h2 className="font-display text-xl font-semibold">{info.title}</h2>
          <p className="max-w-md text-sm leading-relaxed text-muted">{info.text}</p>
          {data.state === "no_questionnaire" && <ButtonLink to={ROUTES.student.survey}>Go to the questionnaire</ButtonLink>}
          {data.state !== "no_questionnaire" && (
            <ButtonLink to={ROUTES.student.home} variant="outline">
              Back to dashboard
            </ButtonLink>
          )}
        </div>
      </>
    );
  }

  const group = data.group;
  const roommates = group.members.filter((member) => member.id !== user.id);
  const pair = data.pairs[Math.min(selected, data.pairs.length - 1)];

  return (
    <>
      <PageHeader
        eyebrow="Roommate matching · Results"
        title="Your room is ready"
        description={`${data.room_type ? ROOM_TYPE_LABELS[data.room_type] : "Shared room"} · approved by the Housing Office on ${formatDate(data.approved_at)}. Your room number comes with the agreement.`}
      />

      <Card className="mb-6" title="Your roommates">
        <ul className="flex flex-wrap gap-3">
          {roommates.map((mate) => (
            <li key={mate.id} className="flex items-center gap-3 rounded-full bg-surface-sunken py-1.5 pl-1.5 pr-4">
              <span className="grid size-9 place-items-center rounded-full bg-highlight-soft font-display text-sm font-semibold">
                {mate.full_name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2)}
              </span>
              <span className="font-semibold">{mate.full_name}</span>
            </li>
          ))}
        </ul>
      </Card>

      {group.members.length > 2 && (
        <Card
          className="mb-6"
          title="How the whole room fits together"
          description="Every pair in the room is scored. The room score looks at the average and at the weakest pair."
        >
          <RoomScoreSummary group={group} highlightId={user.id} />
        </Card>
      )}

      {data.pairs.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Choose a roommate">
          {data.pairs.map((item, index) => (
            <button
              key={item.student_2.id}
              type="button"
              role="tab"
              aria-selected={index === selected}
              onClick={() => setSelected(index)}
              className={cx(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                index === selected ? "bg-nav text-nav-text" : "bg-surface hover:bg-surface-raised",
              )}
            >
              You & {firstName(item.student_2.full_name)} · {item.overall_score}%
            </button>
          ))}
        </div>
      )}

      {pair && <PairView pair={pair} label1="You" label2={firstName(pair.student_2.full_name)} />}
    </>
  );
}
