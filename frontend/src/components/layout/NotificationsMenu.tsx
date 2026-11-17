import { useEffect, useId, useRef, useState } from "react";

import { usePortalInfo } from "../../hooks/usePortalInfo";
import type { Portal } from "../../types/navigation";
import { Icon } from "../ui";

/** Bell in the header. Lists the current announcements for this portal. */
export default function NotificationsMenu({ portal }: { portal: Portal }) {
  const { announcements } = usePortalInfo(portal);
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
        aria-label={`Announcements (${announcements.length})`}
        className="relative grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-surface-raised hover:text-text"
      >
        <Icon name="bell" />
        {announcements.length > 0 && (
          <span className="absolute right-1.5 top-1.5 grid min-w-4 place-items-center rounded-full bg-highlight px-1 text-[0.625rem] font-bold leading-4 text-nav">
            {announcements.length}
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-card bg-surface p-2 shadow-lg shadow-text/10 ring-1 ring-border"
        >
          <p className="px-3 pb-1 pt-2 font-display text-sm font-semibold">Announcements</p>
          <ul className="divide-y divide-border">
            {announcements.map((item) => (
              <li key={item.id} className="px-3 py-3">
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">{item.body}</p>
                <p className="mt-1 text-xs font-medium text-accent">{item.period}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
