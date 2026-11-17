import type { SurveyQuestion } from "../../types/api";
import { cx } from "../../utils/cx";
import { Icon } from "../ui";

interface QuestionFieldProps {
  question: SurveyQuestion;
  /** Number shown before the question (Q1, Q2 ...). */
  number: number;
  value: number[];
  onChange: (optionIds: number[]) => void;
  error?: string;
  disabled?: boolean;
}

/**
 * One question, drawn from its answer_type. single_choice is a radio group, multiple_choice a checkbox group.
 * A new answer type from the backend only needs a new branch here.
 */
export default function QuestionField({ question, number, value, onChange, error, disabled }: QuestionFieldProps) {
  const multiple = question.answer_type === "multiple_choice";
  const supported = question.answer_type === "single_choice" || multiple;
  const errorId = `q-${question.id}-error`;

  const toggle = (optionId: number) => {
    if (!multiple) return onChange([optionId]);
    onChange(value.includes(optionId) ? value.filter((id) => id !== optionId) : [...value, optionId]);
  };

  return (
    <fieldset
      className="min-w-0"
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
      disabled={disabled}
    >
      <legend className="flex items-baseline gap-3 text-lg font-bold leading-snug">
        <span className="shrink-0 font-display text-base font-semibold text-accent">Q{number}</span>
        <span>
          {question.text}
          {!question.is_required && <span className="ml-2 text-sm font-normal text-muted">(optional)</span>}
        </span>
      </legend>
      {multiple && <p className="mt-1 pl-9 text-sm text-muted">Choose all that apply.</p>}

      {supported ? (
        <div className="mt-4 grid gap-2.5 sm:pl-9">
          {question.options.map((option) => {
            const checked = value.includes(option.id);
            return (
              <label
                key={option.id}
                className={cx(
                  "flex cursor-pointer items-center gap-3 rounded-control px-4 py-3 text-sm transition-colors",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                  checked ? "bg-highlight-soft font-medium ring-2 ring-highlight" : "bg-surface-sunken hover:bg-surface-raised",
                  disabled && "cursor-not-allowed opacity-60",
                )}
              >
                <input
                  type={multiple ? "checkbox" : "radio"}
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={checked}
                  onChange={() => toggle(option.id)}
                  className="sr-only"
                />
                <span
                  className={cx(
                    "grid size-5 shrink-0 place-items-center",
                    multiple ? "rounded-md" : "rounded-full",
                    checked ? "bg-accent text-on-accent" : "bg-surface ring-1 ring-border-strong",
                  )}
                  aria-hidden="true"
                >
                  {checked && <Icon name="check" size={13} className="animate-pop" />}
                </span>
                {option.label}
              </label>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 text-sm text-danger sm:pl-9">This answer type ({question.answer_type}) is not supported yet.</p>
      )}

      {error && (
        <p id={errorId} className="mt-2 text-sm text-danger sm:pl-9">
          {error}
        </p>
      )}
    </fieldset>
  );
}
