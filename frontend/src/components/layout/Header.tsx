import { useNavigate } from "react-router-dom";

import { ROUTES } from "../../config/routes";
import { initialsOf, useAuth } from "../../context/AuthContext";
import type { Portal } from "../../types/navigation";
import { Icon } from "../ui";
import LanguageSwitch from "./LanguageSwitch";
import NotificationsMenu from "./NotificationsMenu";
import ProfileMenu from "./ProfileMenu";

interface HeaderProps {
  portal: Portal;
  /** Opens the sidebar drawer on small screens. */
  onMenuClick: () => void;
  menuOpen: boolean;
  menuId: string;
}

export default function Header({ portal, onMenuClick, menuOpen, menuId }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Both portals sit behind RequireRole, so a signed-in user is always present here.
  const isManager = user?.role === "housing_manager";
  const profile = {
    fullName: user?.full_name ?? "",
    initials: initialsOf(user?.full_name ?? ""),
    role: isManager ? "Housing manager" : "Student",
    position: isManager ? "KBTU Housing Office" : "KBTU student",
    email: user?.email ?? "",
  };
  const onLogout = async () => {
    await logout();
    navigate(ROUTES.auth.login, { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur sm:px-6 lg:px-10">
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
        <p className="hidden min-w-0 truncate text-sm text-muted sm:block">
          <span className="hidden xl:inline">
            KBTU <span className="px-1 text-border-strong">/</span> Student housing{" "}
            <span className="px-1 text-border-strong">/</span>
          </span>
          <span className="font-semibold text-text">{portal === "student" ? "Student portal" : "Housing Office"}</span>
        </p>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3">
        <LanguageSwitch />
        <NotificationsMenu portal={portal} />
        <ProfileMenu user={profile} onLogout={onLogout} />
      </div>
    </header>
  );
}
