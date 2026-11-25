import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ManagerDesk } from "../../components/illustrations/Illustrations";
import { Mascot } from "../../components/illustrations/Mascot";
import PageHeader from "../../components/layout/PageHeader";
import ScoreRing from "../../components/matching/ScoreRing";
import { Button, ButtonLink, Card, ErrorState, FormMessage, Icon, LoadingState, Pill, StatCard } from "../../components/ui";
import { ROUTES } from "../../config/routes";
import { useApi } from "../../hooks/useApi";
import { usePageTitle } from "../../hooks/usePageTitle";
import { api } from "../../services/api";
import { errorMessage } from "../../services/apiClient";
import type { EligibleStudent, RoommateGroupSummary } from "../../types/api";
import type { Tone } from "../../types/ui";
import { cx } from "../../utils/cx";
import { ROOM_TYPE_LABELS, formatDate } from "../../utils/studentProgress";

const STATUS: Record<EligibleStudent["match_status"], { label: string; tone: Tone }> = {
  waiting: { label: "No group yet", tone: "neutral" },
  proposed: { label: "Proposed", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
};

export const groupPath = (id: number) => ROUTES.manager.roomGroup.replace(":groupId", String(id));

function GroupCard({
  group,
  busy,
  onDecide,
}: {
  group: RoommateGroupSummary;
  busy: boolean;
  onDecide?: (approve: boolean) => void;
}) {
  const result = group.result;
  return (
    <li className="flex flex-col rounded-card bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">{ROOM_TYPE_LABELS[group.room_type]}</p>
          <ul className="mt-1 flex flex-col gap-0.5">
            {result.members.map((member) => (
              <li key={member.id} className="break-words font-semibold leading-snug">
                {member.full_name}
              </li>
            ))}
          </ul>
        </div>
        <ScoreRing score={result.room_score} level={result.compatibility_level} caption="room" size="md" className="shrink-0" />
      </div>
      {result.members.length > 2 && (
        <p className="mt-3 text-sm text-muted">
          Average pair <b className="text-text">{result.average_pairs}%</b> · weakest pair{" "}
          <b className={result.worst_pair < 60 ? "text-danger" : "text-text"}>{result.worst_pair}%</b>
        </p>
      )}
      {group.status === "approved" && (
        <p className="mt-3 text-sm text-muted">
          Approved {formatDate(group.decided_at)}
          {group.decided_by ? ` by ${group.decided_by}` : ""}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2 pt-1">
        <ButtonLink to={groupPath(group.id)} variant="outline" size="sm">
          Details
        </ButtonLink>
        {onDecide && (
          <>
            <Button size="sm" onClick={() => onDecide(true)} disabled={busy}>
              <Icon name="check" size={16} />
              Approve
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onDecide(false)} disabled={busy}>
              Reject
            </Button>
          </>
        )}
      </div>
    </li>
  );
}

export default function RoomsPage() {
  usePageTitle("Room groups");
  const navigate = useNavigate();
  const { data, error, loading, reload, setData } = useApi(api.matching.overview);
  const [running, setRunning] = useState(false);
  const [busyGroup, setBusyGroup] = useState<number | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [selected, setSelected] = useState<number[]>([]);

  if (loading && !data) return <LoadingState label="Loading room groups…" />;
  if (error || !data) return <ErrorState error={error} onRetry={reload} title="Could not load room groups" />;

  const waiting = data.students.filter((student) => student.match_status === "waiting").length;

  const runMatching = async () => {
    setMessage(null);
    setRunning(true);
    try {
      const next = await api.matching.run();
      setData(next);
      const count = next.last_run?.proposed_count ?? 0;
      setMessage({
        tone: "success",
        text:
          count > 0
            ? `Matching finished: ${count} room ${count === 1 ? "group" : "groups"} proposed from ${next.last_run?.eligible_count} students. Review them below.`
            : "Matching finished, but there are not enough students with the same room type to form a group yet.",
      });
    } catch (reason) {
      setMessage({ tone: "danger", text: errorMessage(reason) });
    } finally {
      setRunning(false);
    }
  };

  const decide = async (group: RoommateGroupSummary, approve: boolean) => {
    setMessage(null);
    setBusyGroup(group.id);
    try {
      await (approve ? api.matching.approve(group.id) : api.matching.reject(group.id));
      const names = group.result.members.map((member) => member.full_name).join(", ");
      setMessage({
        tone: "success",
        text: approve ? `Approved: ${names}. They can now see their room.` : `Rejected: ${names}. They will be matched again in the next run.`,
      });
      setSelected([]);
      reload();
    } catch (reason) {
      setMessage({ tone: "danger", text: errorMessage(reason) });
    } finally {
      setBusyGroup(null);
    }
  };

  const toggle = (id: number) =>
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : current.length < 4 ? [...current, id] : current));

  return (
    <>
      <PageHeader
        eyebrow="Housing Office · Jastar City"
        title="Room groups"
        description="UniDorm scores how well students fit together and proposes room groups. Nothing is final until you approve it."
        actions={
          <Button size="lg" onClick={runMatching} loading={running} disabled={data.students.length < 2}>
            Run matching
          </Button>
        }
      />

      <Card variant="raised" className="mb-6">
        <div className="flex flex-wrap items-center gap-6">
          <ManagerDesk className="w-40 shrink-0" />
          <div className="min-w-0 flex-1 basis-64">
            <p className="font-display text-lg font-semibold">
              {data.last_run
                ? `Last run ${formatDate(data.last_run.created_at)}${data.last_run.started_by ? ` by ${data.last_run.started_by}` : ""}`
                : "Matching has not been run yet"}
            </p>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
              Students are grouped by the room type they asked for. Running again replaces the open proposals; approved
              rooms stay as they are, and students from rejected groups are matched again.
            </p>
          </div>
        </div>
      </Card>

      {message && (
        <div className="mb-6">
          <FormMessage tone={message.tone}>{message.text}</FormMessage>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Ready to match" value={data.students.length} size="lg" />
        <StatCard label="Without a group" value={waiting} size="lg" />
        <StatCard label="Proposed groups" value={data.proposed.length} tone="warning" size="lg" />
        <StatCard label="Approved rooms" value={data.approved.length} tone="success" size="lg" />
      </div>
      {data.waiting_for_questionnaire > 0 && (
        <p className="mt-3 text-sm text-muted">
          {data.waiting_for_questionnaire} more {data.waiting_for_questionnaire === 1 ? "student has" : "students have"} chosen a shared
          room but not submitted the questionnaire yet. They join the matching once they submit.
        </p>
      )}

      <section className="mt-8" aria-labelledby="proposed-title">
        <h2 id="proposed-title" className="mb-4 font-display text-xl font-semibold">
          Waiting for your review
        </h2>
        {data.proposed.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-card bg-surface px-6 py-10 text-center">
            <Mascot mood="sleepy" className="size-24" />
            <p className="font-display font-semibold">No proposals to review</p>
            <p className="max-w-md text-sm text-muted">
              {data.students.length < 2
                ? "At least two students with a submitted questionnaire are needed."
                : "Press Run matching to calculate compatibility and propose room groups."}
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.proposed.map((group) => (
              <GroupCard key={group.id} group={group} busy={busyGroup === group.id} onDecide={(approve) => decide(group, approve)} />
            ))}
          </ul>
        )}
      </section>

      {data.approved.length > 0 && (
        <section className="mt-8" aria-labelledby="approved-title">
          <h2 id="approved-title" className="mb-4 font-display text-xl font-semibold">
            Approved rooms
          </h2>
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.approved.map((group) => (
              <GroupCard key={group.id} group={group} busy={false} />
            ))}
          </ul>
        </section>
      )}

      <Card
        className="mt-8"
        title="Students ready to match"
        description="Shared-room students with a submitted questionnaire. Tick 2–4 students to compare them yourself."
        actions={
          <Button
            size="sm"
            variant="outline"
            disabled={selected.length < 2}
            onClick={() => navigate(`${ROUTES.manager.compare}?ids=${selected.join(",")}`)}
          >
            Compare selected ({selected.length})
          </Button>
        }
      >
        {data.students.length === 0 ? (
          <p className="text-sm text-muted">No student has submitted the questionnaire yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="w-10 py-2 font-semibold">
                    <span className="sr-only">Compare</span>
                  </th>
                  <th className="py-2 font-semibold">Student</th>
                  <th className="py-2 font-semibold">Room type</th>
                  <th className="py-2 font-semibold">Submitted</th>
                  <th className="py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.students.map((student) => {
                  const checked = selected.includes(student.id);
                  return (
                    <tr key={student.id} className={cx(checked && "bg-highlight-soft")}>
                      <td className="py-2.5">
                        <input
                          type="checkbox"
                          className="size-4 accent-[var(--color-accent)]"
                          checked={checked}
                          disabled={!checked && selected.length >= 4}
                          onChange={() => toggle(student.id)}
                          aria-label={`Compare ${student.full_name}`}
                        />
                      </td>
                      <td className="py-2.5">
                        <span className="font-semibold">{student.full_name}</span>
                        <span className="block text-xs text-muted">{student.email}</span>
                      </td>
                      <td className="py-2.5">{ROOM_TYPE_LABELS[student.room_type]}</td>
                      <td className="py-2.5 text-muted">{formatDate(student.submitted_at)}</td>
                      <td className="py-2.5">
                        {student.group_id ? (
                          <Link to={groupPath(student.group_id)} className="hover:opacity-80">
                            <Pill tone={STATUS[student.match_status].tone}>{STATUS[student.match_status].label}</Pill>
                          </Link>
                        ) : (
                          <Pill tone={STATUS[student.match_status].tone}>{STATUS[student.match_status].label}</Pill>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
