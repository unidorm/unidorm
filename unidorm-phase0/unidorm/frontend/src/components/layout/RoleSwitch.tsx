import { Link } from "react-router-dom";

import { PORTALS, PORTAL_ORDER } from "../../config/navigation";
import type { Portal } from "../../types/navigation";
import { cx } from "../../utils/cx";

/**
 * Switches between the two portals. In the prototype this toggle is a demo device;
 * the real role will come from the signed-in user in a later stage.
 */
export default function RoleSwitch({ current }: { current: Portal }) {
  return (
    <nav
      aria-label="Switch portal"
      className="flex items-center gap-1 rounded-full border border-border bg-surface-sunken p-1"
    >
      {PORTAL_ORDER.map((id) => {
        const portal = PORTALS[id];
        const active = id === current;
        return (
          <Link
            key={id}
            to={portal.homePath}
            aria-current={active ? "true" : undefined}
            className={cx(
              "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm",
              active ? "bg-accent text-on-accent" : "text-muted hover:text-text",
            )}
          >
            {portal.switchLabel}
          </Link>
        );
      })}
    </nav>
  );
}
