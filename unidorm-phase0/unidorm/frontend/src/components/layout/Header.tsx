import { sampleUsers } from "../../data/users";
import type { Portal } from "../../types/navigation";
import { Icon } from "../ui";
import ProfileMenu from "./ProfileMenu";
import RoleSwitch from "./RoleSwitch";

interface HeaderProps {
  portal: Portal;
  /** Opens the sidebar drawer on small screens. */
  onMenuClick: () => void;
  menuOpen: boolean;
  menuId: string;
}

export default function Header({ portal, onMenuClick, menuOpen, menuId }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-surface px-4 sm:px-6 lg:px-10">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          className="grid size-10 shrink-0 place-items-center rounded-control text-text hover:bg-surface-raised lg:hidden"
        >
          <Icon name="menu" />
        </button>
        <p className="eyebrow hidden text-muted sm:block">
          {portal === "student" ? "Student portal" : "Housing office"}
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <RoleSwitch current={portal} />
        <ProfileMenu user={sampleUsers[portal]} />
      </div>
    </header>
  );
}
