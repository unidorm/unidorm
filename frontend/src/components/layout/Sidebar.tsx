import { Link, NavLink } from "react-router-dom";

import type { NavItem, PortalConfig } from "../../types/navigation";
import { cx } from "../../utils/cx";
import { ROUTES } from "../../config/routes";
import { HelpBubbles } from "../illustrations/Illustrations";
import { Icon } from "../ui";
import ApiStatus from "./ApiStatus";

interface SidebarProps {
  portal: PortalConfig;
  /** Called after a link is chosen, so the mobile drawer can close. */
  onNavigate?: () => void;
  /** Rendered inside the mobile drawer: shows a close button. */
  onClose?: () => void;
}

/** Short note after a menu item: "new" for the matching module, "later" for planned sections. */
function StatusBadge({ item }: { item: NavItem }) {
  if (item.status === "available") return null;
  return (
    item.status === "later" ? (
      <span className="text-[0.6875rem] font-medium text-nav-muted">later</span>
    ) : (
      <span className="rounded-full bg-highlight px-2 py-0.5 text-[0.625rem] font-bold text-nav">new</span>
    )
  );
}

export default function Sidebar({ portal, onNavigate, onClose }: SidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 px-5 pb-5 pt-6">
        <Link to={portal.homePath} onClick={onNavigate} className="flex min-w-0 items-center gap-3 rounded-control">
          <span
            className="grid size-11 shrink-0 place-items-center rounded-control bg-white font-display text-[0.6875rem] font-bold tracking-wide text-nav"
            aria-hidden="true"
          >
            KBTU
          </span>
          <span className="min-w-0">
            <span className="block font-display text-lg font-semibold leading-tight text-nav-text">
              Uni<span className="text-highlight">Dorm</span>
            </span>
            <span className="block truncate text-xs text-nav-muted">{portal.subtitle}</span>
          </span>
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid size-9 shrink-0 place-items-center rounded-control text-nav-muted hover:bg-nav-active hover:text-nav-text lg:hidden"
          >
            <Icon name="close" />
          </button>
        )}
      </div>

      <nav aria-label={`${portal.sidebarLabel} navigation`} className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="eyebrow mb-2 px-3 text-nav-muted">{portal.sidebarLabel}</p>
        <ul className="flex flex-col gap-1">
          {portal.items.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                onClick={onNavigate}
                title={item.status === "later" ? "Planned for a later sprint" : undefined}
                className={({ isActive }) =>
                  cx(
                    "flex h-10 items-center gap-3 rounded-control px-3 text-sm transition-colors",
                    isActive
                      ? "bg-nav-active font-semibold text-nav-text"
                      : "font-medium hover:bg-nav-active/60 hover:text-nav-text",
                    !isActive && (item.status === "later" ? "text-nav-muted/70" : "text-nav-muted"),
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
                        isActive ? "text-nav-text" : item.status === "later" ? "opacity-60" : undefined,
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

      {portal.id === "student" && (
        <Link
          to={ROUTES.student.help}
          onClick={onNavigate}
          className="mx-3 mb-3 flex items-center gap-3 rounded-card bg-nav-active p-3 text-sm text-nav-text transition-colors hover:bg-nav-active/80"
        >
          <HelpBubbles className="w-14 shrink-0" />
          <span className="min-w-0">
            <span className="block font-semibold">Questions?</span>
            <span className="block text-xs text-nav-muted">How accommodation works</span>
          </span>
        </Link>
      )}

      <div className="border-t border-white/10 px-5 py-4">
        <ApiStatus />
      </div>
    </div>
  );
}
