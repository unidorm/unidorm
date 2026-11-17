import type { ReactNode } from "react";

import { errorMessage } from "../../services/apiClient";
import { cx } from "../../utils/cx";
import Button from "./Button";
import { Mascot } from "../illustrations/Mascot";

/** Shown while a page waits for the API. */
export function LoadingState({ label = "Loading…", className }: { label?: string; className?: string }) {
  return (
    <div role="status" className={cx("flex flex-col items-center justify-center gap-2 py-16 text-sm font-semibold text-muted", className)}>
      <Mascot mood="happy" className="size-20 animate-bob" />
      {label}
    </div>
  );
}

/** Shown when a request failed, with a way to try again. */
export function ErrorState({
  error,
  onRetry,
  title = "Something went wrong",
  className,
}: {
  error: unknown;
  onRetry?: () => void;
  title?: string;
  className?: string;
}) {
  return (
    <div role="alert" className={cx("flex flex-col items-center gap-3 rounded-card bg-surface px-6 py-12 text-center", className)}>
      <Mascot mood="think" className="size-24" />
      <p className="font-display text-lg font-semibold">{title}</p>
      <p className="max-w-md text-sm text-muted">{errorMessage(error)}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/** Inline message under a form or action: success, error or info. */
export function FormMessage({ tone, children }: { tone: "success" | "danger" | "info"; children: ReactNode }) {
  return (
    <p
      role={tone === "danger" ? "alert" : "status"}
      className={cx(
        "rounded-control px-4 py-3 text-sm",
        tone === "success" && "bg-success/10 text-success",
        tone === "danger" && "bg-danger/10 text-danger",
        tone === "info" && "bg-accent/10 text-accent",
      )}
    >
      {children}
    </p>
  );
}
