import { useId, type InputHTMLAttributes, type ReactNode } from "react";

import { cx } from "../../utils/cx";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  /** Helper text shown under the field when there is no error. */
  hint?: string;
  /** Error message. Also switches the field to its error style. */
  error?: string;
  /** Icon or element shown inside the field, on the left. */
  startAdornment?: ReactNode;
}

export default function Input({
  label,
  hint,
  error,
  startAdornment,
  id,
  className,
  disabled,
  ...rest
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-muted">
          {label}
        </label>
      )}
      <div className="relative">
        {startAdornment && (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted">
            {startAdornment}
          </span>
        )}
        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className={cx(
            "h-11 w-full rounded-control border bg-surface-sunken text-sm text-text placeholder:text-muted/70",
            "transition-colors focus:outline-none focus-visible:outline-none focus:ring-2",
            startAdornment ? "pl-10 pr-3.5" : "px-3.5",
            error
              ? "border-danger focus:ring-danger/40"
              : "border-border enabled:hover:border-border-strong focus:border-accent focus:ring-accent/30",
            disabled && "cursor-not-allowed opacity-50",
          )}
          {...rest}
        />
      </div>
      {message && (
        <p id={messageId} className={cx("text-xs", error ? "text-danger" : "text-muted")}>
          {message}
        </p>
      )}
    </div>
  );
}
