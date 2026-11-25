import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";

import PageHeader from "../../components/layout/PageHeader";
import GroupDetailView from "../../components/matching/GroupDetailView";
import { Button, ButtonLink, ErrorState, FormMessage, Icon, LoadingState, Pill } from "../../components/ui";
import { ROUTES } from "../../config/routes";
import { useApi } from "../../hooks/useApi";
import { usePageTitle } from "../../hooks/usePageTitle";
import { api } from "../../services/api";
import { errorMessage } from "../../services/apiClient";
import type { GroupStatus } from "../../types/api";
import type { Tone } from "../../types/ui";
import { ROOM_TYPE_LABELS, formatDate } from "../../utils/studentProgress";

const STATUS: Record<GroupStatus, { label: string; tone: Tone }> = {
  proposed: { label: "Waiting for review", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
};

export default function RoomGroupPage() {
  usePageTitle("Room group");
  const groupId = Number(useParams().groupId);
  const load = useCallback((signal: AbortSignal) => api.matching.group(groupId, signal), [groupId]);
  const { data, error, loading, reload } = useApi(load);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

  if (loading && !data) return <LoadingState label="Loading the room group…" />;
  if (error || !data) return <ErrorState error={error} onRetry={reload} title="Could not load this room group" />;

  const decide = async (approve: boolean) => {
    setBusy(true);
    setMessage(null);
    try {
      await (approve ? api.matching.approve(data.id) : api.matching.reject(data.id));
      setMessage({
        tone: "success",
        text: approve ? "Approved. The students can now see their room and roommates." : "Rejected. These students will be matched again in the next run.",
      });
      reload();
    } catch (reason) {
      setMessage({ tone: "danger", text: errorMessage(reason) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <ButtonLink to={ROUTES.manager.rooms} variant="outline" size="sm" className="mb-4">
        <Icon name="arrowLeft" size={16} />
        All room groups
      </ButtonLink>
      <PageHeader
        eyebrow={`${ROOM_TYPE_LABELS[data.room_type]} · proposed ${formatDate(data.created_at)}`}
        title={data.members.map((member) => member.full_name).join(", ")}
        actions={<Pill tone={STATUS[data.status].tone}>{STATUS[data.status].label}</Pill>}
      />
      {message && (
        <div className="mb-6">
          <FormMessage tone={message.tone}>{message.text}</FormMessage>
        </div>
      )}
      {data.status === "proposed" ? (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-card bg-surface p-4">
          <p className="min-w-0 flex-1 basis-64 text-sm text-muted">
            Check the scores and the answers below. Approve to confirm this room, or reject to match these students again.
          </p>
          <Button onClick={() => decide(true)} loading={busy}>
            <Icon name="check" size={18} />
            Approve group
          </Button>
          <Button variant="secondary" onClick={() => decide(false)} disabled={busy}>
            Reject
          </Button>
        </div>
      ) : (
        data.decided_at && (
          <p className="mb-6 text-sm text-muted">
            {STATUS[data.status].label} on {formatDate(data.decided_at)}
            {data.decided_by ? ` by ${data.decided_by}` : ""}.
          </p>
        )
      )}
      <GroupDetailView detail={data} />
    </>
  );
}
