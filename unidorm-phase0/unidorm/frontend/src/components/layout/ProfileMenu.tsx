import { useEffect, useId, useRef, useState } from "react";

import type { SampleUser } from "../../types/domain";
import { Icon } from "../ui";

function Avatar({ initials, size = "md" }: { initials: string; size?: "md" | "lg" }) {
  return (
    <span
      className={
        size === "lg"
          ? "grid size-12 shrink-0 place-items-center rounded-full border border-border-strong bg-surface-raised text-sm font-bold"
          : "grid size-9 shrink-0 place-items-center rounded-full border border-border-strong bg-surface-raised text-xs font-bold"
      }
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

/** Avatar, name and role in the header, with a small panel of profile details. */
export default function ProfileMenu({ user }: { user: SampleUser }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Profile: ${user.fullName}, ${user.position}`}
        className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-surface-raised sm:pr-3"
      >
        <Avatar initials={user.initials} />
        <span className="hidden min-w-0 text-left sm:block">
          <span className="block truncate text-sm font-semibold leading-tight">{user.fullName}</span>
          <span className="block truncate text-xs text-muted">{user.position}</span>
        </span>
        <Icon name="chevronDown" size={16} className="text-muted" />
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-card border border-border-strong bg-surface p-4 shadow-xl shadow-black/40"
        >
          <div className="flex items-center gap-3">
            <Avatar initials={user.initials} size="lg" />
            <div className="min-w-0">
              <p className="truncate font-semibold">{user.fullName}</p>
              <p className="truncate text-sm text-muted">{user.email}</p>
            </div>
          </div>
          <dl className="mt-4 divide-y divide-border border-t border-border text-sm">
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-muted">Role</dt>
              <dd className="font-medium">{user.role}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-muted">Position</dt>
              <dd className="font-medium">{user.position}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Sample profile. Sign-in is not connected at this stage.
          </p>
        </div>
      )}
    </div>
  );
}
