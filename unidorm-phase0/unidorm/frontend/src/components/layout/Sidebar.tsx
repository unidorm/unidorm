import { Link, NavLink } from "react-router-dom";

import type { NavItem, PortalConfig } from "../../types/navigation";
import { cx } from "../../utils/cx";
import { Icon, Pill } from "../ui";
import ApiStatus from "./ApiStatus";

interface SidebarProps {
  portal: PortalConfig;
  /** Called after a link is chosen, so the mobile drawer can close. */
  onNavigate?: () => void;
  /** Rendered inside the mobile drawer: shows a close button. */
  onClose?: () => void;
}

function StatusBadge({ item }: { item: NavItem }) {
  if (item.status === "later") {
    return (
      <Pill caps tone="neutral">
        Later
      </Pill>
    );
  }
  if (item.status === "module") {
    return (
      <Pill caps tone="accent">
        Module
      </Pill>
    );
  }
  return null;
}

export default function Sidebar({ portal, onNavigate, onClose }: SidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 px-5 pb-5 pt-6">
        <Link to={portal.homePath} onClick={onNavigate} className="flex min-w-0 items-center gap-3 rounded-control">
          <span
            className="grid size-11 shrink-0 place-items-center rounded-control bg-accent text-[0.6875rem] font-extrabold tracking-tight text-on-accent"
            aria-hidden="true"
          >
            KBTU
          </span>
          <span className="min-w-0">
            <span className="block font-display text-base font-bold leading-tight">UniDorm</span>
            <span className="block truncate text-xs text-muted">{portal.subtitle}</span>
          </span>
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid size-9 shrink-0 place-items-center rounded-control text-muted hover:bg-surface-raised hover:text-text lg:hidden"
          >
            <Icon name="close" />
          </button>
        )}
      </div>

      <nav aria-label={`${portal.sidebarLabel} navigation`} className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="eyebrow mb-3 px-3 text-muted">{portal.sidebarLabel}</p>
        <ul className="flex flex-col gap-1">
          {portal.items.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                onClick={onNavigate}
                title={item.status === "later" ? "Planned for a later sprint" : undefined}
                className={({ isActive }) =>
                  cx(
                    "flex h-11 items-center gap-3 rounded-control px-3 text-sm transition-colors",
                    isActive
                      ? "bg-surface-raised font-semibold text-text"
                      : "font-medium hover:bg-surface-raised/50 hover:text-text",
                    !isActive && (item.status === "later" ? "text-muted/70" : "text-muted"),
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      name={item.icon}
                      size={18}
                      className={cx(
                        "shrink-0",
                        isActive ? "text-accent" : item.status === "later" ? "opacity-60" : undefined,
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    <StatusBadge item={item} />
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border px-5 py-4">
        <ApiStatus />
      </div>
    </div>
  );
}
