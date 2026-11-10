import { useApiHealth, type ApiStatus as Status } from "../../hooks/useApiHealth";
import { cx } from "../../utils/cx";

const text: Record<Status, string> = {
  checking: "Checking API…",
  online: "API online",
  offline: "API offline",
};

const dot: Record<Status, string> = {
  checking: "bg-muted",
  online: "bg-success",
  offline: "bg-danger",
};

/** Small development aid: shows whether GET /api/health answers. */
export default function ApiStatus() {
  const status = useApiHealth();
  return (
    <p className="flex items-center gap-2 text-xs text-muted" role="status">
      <span className={cx("size-2 rounded-full", dot[status])} aria-hidden="true" />
      {text[status]}
    </p>
  );
}
