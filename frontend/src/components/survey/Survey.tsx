import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { errorMessage } from "../../services/apiClient";
import type { AnswerMap, SurveyQuestion, SurveyStructure } from "../../types/api";
import { MascotTip } from "../illustrations/Mascot";
import { Button, Card, FormMessage, Icon } from "../ui";
import QuestionField from "./QuestionField";
import SurveyProgress from "./SurveyProgress";

export interface SurveyProps {
  /** Categories and questions as returned by GET /api/survey. Nothing about them is hardcoded here. */
  structure: SurveyStructure;
  /** Answers already saved on the server. */
  initialAnswers: AnswerMap;
  /** Category to open first (from the URL). Falls back to the first unfinished one. */
  initialCategoryId?: string | null;
  /** Saves changed answers. Should throw on failure. */
  save: (answers: AnswerMap) => Promise<void>;
  /** Called after the last category is valid and saved. */
  onComplete: () => void;
  onCategoryChange?: (categoryId: string) => void;
  /** localStorage key for answers that are not on the server yet (per student). */
  draftKey: string;
}

type SaveState = "idle" | "saving" | "saved" | "error";

const AUTOSAVE_DELAY_MS = 800;

function readDraft(key: string): AnswerMap {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? (parsed as AnswerMap) : {};
  } catch {
    return {};
  }
}

function writeDraft(key: string, draft: AnswerMap) {
  try {
    if (Object.keys(draft).length === 0) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // Storage can be blocked (private mode); the server autosave still works.
  }
}

const isAnswered = (answers: AnswerMap, question: SurveyQuestion) => (answers[question.id]?.length ?? 0) > 0;

/**
 * The habits questionnaire: one category per step, progress on top, Previous / Next below.
 * Answers are kept in one map for all categories, autosaved shortly after each change and
 * saved again before moving on, so going back, forward or refreshing never loses them.
 */
export default function Survey({
  structure,
  initialAnswers,
  initialCategoryId,
  save,
  onComplete,
  onCategoryChange,
  draftKey,
}: SurveyProps) {
  const { categories } = structure;
  const validQuestionIds = useMemo(
    () => new Set(categories.flatMap((category) => category.questions.map((question) => String(question.id)))),
    [categories],
  );

  // Server answers, with any unsaved local changes from before a refresh on top.
  const [answers, setAnswers] = useState<AnswerMap>(() => {
    const draft = readDraft(draftKey);
    const merged: AnswerMap = { ...initialAnswers };
    for (const [id, value] of Object.entries(draft)) if (validQuestionIds.has(id)) merged[id] = value;
    return merged;
  });
  const [dirty, setDirty] = useState<AnswerMap>(() => {
    const draft = readDraft(draftKey);
    return Object.fromEntries(Object.entries(draft).filter(([id]) => validQuestionIds.has(id)));
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);

  const firstUnfinished = useMemo(() => {
    const index = categories.findIndex((category) =>
      category.questions.some((question) => question.is_required && !isAnswered(answers, question)),
    );
    return index === -1 ? categories.length - 1 : index;
  }, [categories, answers]);

  const [step, setStep] = useState(() => {
    const fromUrl = categories.findIndex((category) => category.id === initialCategoryId);
    // Do not open a category beyond the first unfinished one.
    return fromUrl !== -1 && fromUrl <= firstUnfinished ? fromUrl : firstUnfinished;
  });
  const category = categories[step];

  useEffect(() => {
    if (category) onCategoryChange?.(category.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category?.id]);

  // Keep the unsaved changes in storage, so a refresh or a lost connection does not lose them.
  useEffect(() => writeDraft(draftKey, dirty), [draftKey, dirty]);

  // --- Saving -------------------------------------------------------------------------------
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const inFlight = useRef<Promise<boolean> | null>(null);

  /** Sends every unsaved change. Resolves to false when the save failed. */
  const flush = useCallback(async (): Promise<boolean> => {
    if (inFlight.current) await inFlight.current;
    const pending = dirtyRef.current;
    if (Object.keys(pending).length === 0) return true;

    const run = (async () => {
      setSaveState("saving");
      try {
        await save(pending);
        // Drop only what was sent and has not changed again meanwhile.
        setDirty((current) => {
          const next = { ...current };
          for (const [id, value] of Object.entries(pending)) {
            if (next[id] === value) delete next[id];
          }
          return next;
        });
        setSaveState("saved");
        setSaveError(null);
        return true;
      } catch (reason) {
        setSaveState("error");
        setSaveError(errorMessage(reason));
        return false;
      }
    })();
    inFlight.current = run;
    const ok = await run;
    inFlight.current = null;
    return ok;
  }, [save]);

  // Autosave a moment after the last change.
  useEffect(() => {
    if (Object.keys(dirty).length === 0) return;
    const timer = window.setTimeout(() => void flush(), AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [dirty, flush]);

  // Warn before closing the tab while something is still unsaved.
  useEffect(() => {
    if (Object.keys(dirty).length === 0) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // --- Answers and navigation ---------------------------------------------------------------
  const answeredByCategory = useMemo(
    () =>
      Object.fromEntries(
        categories.map((item) => [item.id, item.questions.filter((question) => isAnswered(answers, question)).length]),
      ),
    [categories, answers],
  );
  const answeredTotal = Object.values(answeredByCategory).reduce((sum, count) => sum + count, 0);

  const onAnswer = (question: SurveyQuestion, optionIds: number[]) => {
    const key = String(question.id);
    setAnswers((current) => ({ ...current, [key]: optionIds }));
    setDirty((current) => ({ ...current, [key]: optionIds }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const goTo = (index: number) => {
    setErrors({});
    setStep(index);
    window.scrollTo({ top: 0 });
  };

  const onNext = async () => {
    const missing = category.questions.filter((question) => question.is_required && !isAnswered(answers, question));
    if (missing.length > 0) {
      setErrors(Object.fromEntries(missing.map((question) => [String(question.id), "Please choose an answer."])));
      document.getElementById(`question-${missing[0].id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setMoving(true);
    const ok = await flush();
    setMoving(false);
    if (!ok) return;
    if (step === categories.length - 1) onComplete();
    else goTo(step + 1);
  };

  if (!category) return <FormMessage tone="info">The questionnaire has no questions yet.</FormMessage>;

  // Question numbers run across categories (Q1–Q15), whatever the category sizes are.
  const firstNumber = categories.slice(0, step).reduce((sum, item) => sum + item.questions.length, 0) + 1;
  const isLast = step === categories.length - 1;
  const errorCount = Object.keys(errors).length;
  const left = categories.length - step - 1;
  const tip =
    step === 0
      ? "No right or wrong answers here. Just tell me how you really live!"
      : isLast
        ? "Last section! After it you can check all your answers."
        : `Great job! ${left} more ${left === 1 ? "section" : "sections"} after this one.`;

  return (
    <div className="flex flex-col gap-6">
      <SurveyProgress
        categories={categories}
        currentIndex={step}
        answeredByCategory={answeredByCategory}
        answeredTotal={answeredTotal}
        totalQuestions={structure.total_questions}
        onSelect={goTo}
        maxReachable={firstUnfinished}
      />

      <MascotTip mood={isLast ? "cheer" : step === 0 ? "wave" : "happy"}>{tip}</MascotTip>

      <Card padding="lg" title={category.title} description={category.description}>
        {errorCount > 0 && (
          <div className="mb-6">
            <FormMessage tone="danger">
              Answer {errorCount === 1 ? "the marked question" : `the ${errorCount} marked questions`} to continue.
            </FormMessage>
          </div>
        )}
        <div className="flex flex-col gap-8">
          {category.questions.map((question, index) => (
            <div key={question.id} id={`question-${question.id}`} className="scroll-mt-24">
              <QuestionField
                question={question}
                number={firstNumber + index}
                value={answers[question.id] ?? []}
                onChange={(optionIds) => onAnswer(question, optionIds)}
                error={errors[question.id]}
              />
            </div>
          ))}
        </div>

        {saveState === "error" && saveError && (
          <div className="mt-6">
            <FormMessage tone="danger">
              Your last answers are not saved yet: {saveError} They are kept on this device and will be sent when you
              press Next.
            </FormMessage>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
          <Button variant="secondary" onClick={() => goTo(step - 1)} disabled={step === 0 || moving}>
            <Icon name="arrowLeft" size={18} />
            Previous
          </Button>
          <p className="order-last w-full text-center text-xs text-muted sm:order-none sm:w-auto" aria-live="polite">
            {saveState === "saving" && "Saving…"}
            {saveState === "saved" && Object.keys(dirty).length === 0 && "All answers saved"}
          </p>
          <Button onClick={onNext} loading={moving}>
            {isLast ? "Review answers" : "Next"}
            <Icon name="arrowRight" size={18} />
          </Button>
        </div>
      </Card>
    </div>
  );
}
