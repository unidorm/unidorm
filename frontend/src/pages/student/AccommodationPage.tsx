import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Beds } from "../../components/illustrations/Illustrations";
import PageHeader from "../../components/layout/PageHeader";
import { Button, ButtonLink, Callout, Card, ErrorState, FormMessage, Icon, LoadingState, Stepper } from "../../components/ui";
import { ROUTES } from "../../config/routes";
import { accommodationStages, dormRulesNote, roomTypeOptions } from "../../data/student";
import { useApi } from "../../hooks/useApi";
import { api } from "../../services/api";
import { errorMessage } from "../../services/apiClient";
import type { RoomType } from "../../types/api";
import { cx } from "../../utils/cx";
import { ROOM_TYPE_LABELS, currentStage, formatDate } from "../../utils/studentProgress";

export default function AccommodationPage() {
  const navigate = useNavigate();
  const { data: dashboard, error, loading, reload } = useApi(api.student.dashboard);
  const [selected, setSelected] = useState<RoomType | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Start from the saved choice, so a refresh or a new sign-in shows it again.
  useEffect(() => {
    if (dashboard) setSelected(dashboard.room_preference.room_type);
  }, [dashboard]);

  if (loading && !dashboard) return <LoadingState label="Loading your application…" />;
  if (error || !dashboard) return <ErrorState error={error} onRetry={reload} title="Could not load your application" />;

  const saved = dashboard.room_preference;
  const locked = !saved.can_change;
  const stage = currentStage(dashboard);

  const onContinue = async () => {
    if (!selected) return;
    setSaveError(null);
    setSaving(true);
    try {
      if (selected !== saved.room_type) await api.student.setRoomPreference(selected);
      if (selected === "single") {
        navigate(ROUTES.student.home);
      } else {
        navigate(ROUTES.student.survey);
      }
    } catch (reason) {
      setSaveError(errorMessage(reason));
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Accommodation · Jastar City"
        title="Choose your room type"
        description="Pick the kind of room you want to live in. You can change it until you submit the habits questionnaire."
      />

      <Stepper steps={accommodationStages} currentIndex={stage} className="mb-8" />

      <Card
        title="What kind of room do you want?"
        description={
          saved.room_type
            ? `Saved choice: ${ROOM_TYPE_LABELS[saved.room_type]} (${formatDate(saved.updated_at)}).`
            : "Nothing chosen yet."
        }
      >
        {locked && (
          <div className="mb-5">
            <FormMessage tone="info">
              Your questionnaire is submitted, so the room type is locked. Contact the Housing Office to change it.
            </FormMessage>
          </div>
        )}

        <fieldset disabled={locked || saving}>
          <legend className="sr-only">Room type</legend>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {roomTypeOptions.map((option) => {
              const checked = selected === option.id;
              return (
                <label
                  key={option.id}
                  className={cx(
                    "relative flex cursor-pointer flex-col rounded-card p-5 transition-colors",
                    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                    checked ? "bg-highlight-soft ring-2 ring-highlight" : "bg-surface-sunken hover:bg-surface-raised",
                    locked && "cursor-not-allowed",
                    locked && !checked && "opacity-60",
                  )}
                >
                  <input
                    type="radio"
                    name="room-type"
                    value={option.id}
                    checked={checked}
                    onChange={() => setSelected(option.id)}
                    className="sr-only"
                  />
                  <span
                    className={cx(
                      "absolute right-4 top-4 grid size-6 place-items-center rounded-full",
                      checked ? "bg-accent text-on-accent" : "bg-surface ring-1 ring-border-strong",
                    )}
                    aria-hidden="true"
                  >
                    {checked && <Icon name="check" size={14} className="animate-pop" />}
                  </span>
                  <Beds count={option.capacity} className="max-w-full" />
                  <span className="mt-4 font-display font-semibold">{option.title}</span>
                  <span className="mt-1 text-sm text-muted">{option.note}</span>
                  {saved.room_type === option.id && (
                    <span className="mt-3 text-xs font-semibold text-success">Saved</span>
                  )}
                </label>
              );
            })}
          </div>
        </fieldset>

        <Callout className="mt-5">{dormRulesNote}</Callout>

        {saveError && (
          <div className="mt-5">
            <FormMessage tone="danger">{saveError}</FormMessage>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <ButtonLink to={ROUTES.student.home} variant="outline">
            Back
          </ButtonLink>
          {locked ? (
            <ButtonLink to={ROUTES.student.surveyReview}>See my answers</ButtonLink>
          ) : (
            <Button onClick={onContinue} disabled={!selected} loading={saving}>
              Continue
              <Icon name="arrowRight" size={18} />
            </Button>
          )}
          {!selected && !locked && <p className="text-sm text-muted">Choose one option to continue.</p>}
          {selected && !locked && (
            <p className="text-sm text-muted">
              {selected === "single" ? "Single rooms skip the questionnaire." : "Next: the habits questionnaire."}
            </p>
          )}
        </div>
      </Card>
    </>
  );
}
