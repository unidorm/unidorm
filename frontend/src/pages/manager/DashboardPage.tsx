import { Link } from "react-router-dom";

import PageHeader from "../../components/layout/PageHeader";
import { LEVEL_TONE } from "../../components/matching/levels";
import { ButtonLink, Card, ErrorState, LoadingState, Pill, ProgressBar, StatCard } from "../../components/ui";
import { ROUTES } from "../../config/routes";
import { useApi } from "../../hooks/useApi";
import { usePageTitle } from "../../hooks/usePageTitle";
import { api } from "../../services/api";
import type { RoomType } from "../../types/api";
import { ROOM_TYPE_LABELS } from "../../utils/studentProgress";
import { groupPath } from "./RoomsPage";

const SHARED: RoomType[] = ["double", "triple", "quad"];

/** Overview built from the same matching data as the Room groups page (no sample numbers). */
export default function DashboardPage() {
  usePageTitle("Dashboard");
  const { data, error, loading, reload } = useApi(api.matching.overview);

  if (loading && !data) return <LoadingState label="Loading the dashboard…" />;
  if (error || !data) return <ErrorState error={error} onRetry={reload} title="Could not load the dashboard" />;

  const lowRooms = [...data.proposed, ...data.approved].filter((group) => group.result.compatibility_level === "Low").length;

  return (
    <>
      <PageHeader
        eyebrow="Housing Office · Jastar City"
        title="Dashboard"
        description="Matching progress at a glance. Details and decisions are on the Room groups page."
        actions={<ButtonLink to={ROUTES.manager.rooms}>Open room groups</ButtonLink>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Approved rooms" value={data.approved.length} tone="success" size="lg" />
        <StatCard label="Waiting for review" value={data.proposed.length} tone="warning" size="lg" />
        <StatCard label="Low compatibility" value={lowRooms} tone="danger" size="lg" />
        <StatCard label="Questionnaire not submitted" value={data.waiting_for_questionnaire} tone="accent" size="lg" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Students by room type" description="Students with a submitted questionnaire who are in an approved room.">
          <div className="flex flex-col gap-4">
            {SHARED.map((type) => {
              const students = data.students.filter((student) => student.room_type === type);
              const placed = students.filter((student) => student.match_status === "approved").length;
              return (
                <ProgressBar
                  key={type}
                  label={ROOM_TYPE_LABELS[type]}
                  valueLabel={`${placed} of ${students.length} placed`}
                  value={placed}
                  max={Math.max(students.length, 1)}
                />
              );
            })}
          </div>
        </Card>

        <Card title="Waiting for review" description="Proposed groups, lowest room score first.">
          {data.proposed.length === 0 ? (
            <p className="text-sm text-muted">Nothing to review. Run matching on the Room groups page.</p>
          ) : (
            <ul className="divide-y divide-border">
              {[...data.proposed]
                .sort((a, b) => a.result.room_score - b.result.room_score)
                .map((group) => (
                  <li key={group.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <Link to={groupPath(group.id)} className="min-w-0 hover:underline">
                      <p className="truncate text-sm font-semibold">
                        {group.result.members.map((member) => member.full_name).join(", ")}
                      </p>
                      <p className="mt-0.5 text-sm text-muted">
                        {ROOM_TYPE_LABELS[group.room_type]} · weakest pair {group.result.worst_pair}%
                      </p>
                    </Link>
                    <Pill tone={LEVEL_TONE[group.result.compatibility_level]}>{group.result.room_score}%</Pill>
                  </li>
                ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
