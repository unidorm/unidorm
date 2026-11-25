import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import PageHeader from "../../components/layout/PageHeader";
import GroupDetailView from "../../components/matching/GroupDetailView";
import { Button, ButtonLink, Card, ErrorState, FormMessage, Icon, LoadingState } from "../../components/ui";
import { ROUTES } from "../../config/routes";
import { useApi } from "../../hooks/useApi";
import { usePageTitle } from "../../hooks/usePageTitle";
import { api } from "../../services/api";
import { errorMessage } from "../../services/apiClient";
import type { GroupDetail } from "../../types/api";
import { cx } from "../../utils/cx";
import { ROOM_TYPE_LABELS } from "../../utils/studentProgress";

/** Manager tool: pick 2-4 students and see how compatible they would be. The backend does all scoring. */
export default function ComparePage() {
  usePageTitle("Compare students");
  const [params, setParams] = useSearchParams();
  const ids = (params.get("ids") ?? "").split(",").map(Number).filter((id) => Number.isInteger(id) && id > 0);
  const idsKey = ids.join(",");
  const overview = useApi(api.matching.overview);
  const [selected, setSelected] = useState<number[]>(ids);
  const [result, setResult] = useState<GroupDetail | null>(null);
  const [comparing, setComparing] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  // Compare whatever is in the URL (?ids=3,7), so results can be reloaded and shared.
  useEffect(() => {
    const current = idsKey ? idsKey.split(",").map(Number) : [];
    setSelected(current);
    setResult(null);
    if (current.length < 2) return;
    let cancelled = false;
    setComparing(true);
    setCompareError(null);
    api.matching
      .compare(current)
      .then((detail) => !cancelled && setResult(detail))
      .catch((reason) => !cancelled && setCompareError(errorMessage(reason)))
      .finally(() => !cancelled && setComparing(false));
    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  if (overview.loading && !overview.data) return <LoadingState label="Loading students…" />;
  if (overview.error || !overview.data)
    return <ErrorState error={overview.error} onRetry={overview.reload} title="Could not load students" />;

  const toggle = (id: number) =>
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : current.length < 4 ? [...current, id] : current));

  return (
    <>
      <ButtonLink to={ROUTES.manager.rooms} variant="outline" size="sm" className="mb-4">
        <Icon name="arrowLeft" size={16} />
        All room groups
      </ButtonLink>
      <PageHeader
        eyebrow="Housing Office · Compare students"
        title="Compare students"
        description="Choose 2 to 4 students to see their pair scores and, for 3–4 students, the room score."
      />

      <Card
        className="mb-6"
        title="Students"
        description={`${selected.length} of 4 chosen`}
        actions={
          <Button onClick={() => setParams({ ids: selected.join(",") })} disabled={selected.length < 2} loading={comparing}>
            Compare
          </Button>
        }
      >
        {overview.data.students.length === 0 ? (
          <p className="text-sm text-muted">No student has submitted the questionnaire yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {overview.data.students.map((student) => {
              const checked = selected.includes(student.id);
              return (
                <li key={student.id}>
                  <button
                    type="button"
                    aria-pressed={checked}
                    onClick={() => toggle(student.id)}
                    disabled={!checked && selected.length >= 4}
                    className={cx(
                      "rounded-full px-4 py-2 text-left text-sm transition-colors disabled:opacity-50",
                      checked ? "bg-highlight-soft font-semibold ring-2 ring-highlight" : "bg-surface-sunken hover:bg-surface-raised",
                    )}
                  >
                    {student.full_name}
                    <span className="ml-2 text-xs text-muted">{ROOM_TYPE_LABELS[student.room_type]}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {compareError && <FormMessage tone="danger">{compareError}</FormMessage>}
      {comparing && !result && <LoadingState label="Calculating compatibility…" />}
      {result && <GroupDetailView key={idsKey} detail={result} />}
    </>
  );
}
