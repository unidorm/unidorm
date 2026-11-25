import { Navigate, Outlet, useLocation } from "react-router-dom";

import { LoadingState } from "../components/ui";
import { ROUTES } from "../config/routes";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types/api";

/** Where each role lands after signing in. */
export const HOME_BY_ROLE: Record<UserRole, string> = {
  student: ROUTES.student.home,
  housing_manager: ROUTES.manager.rooms,
};

/**
 * Lets only signed-in users with the given role through. Signed-out visitors go to the sign-in page
 * (and come back afterwards); users with the other role go to their own portal.
 */
export default function RequireRole({ role }: { role: UserRole }) {
  const { status, user, loggedOutByUser } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="grid min-h-full place-items-center bg-page">
        <LoadingState label="Checking your session…" />
      </div>
    );
  }
  if (status === "signed-out" || !user) {
    // After "Log out" the next person starts on their own home page, not on the page the last user was on.
    const state = loggedOutByUser ? undefined : { from: location.pathname + location.search };
    return <Navigate to={ROUTES.auth.login} replace state={state} />;
  }
  if (user.role !== role) {
    return <Navigate to={HOME_BY_ROLE[user.role]} replace />;
  }
  return <Outlet />;
}

/** "/" sends everyone to their own portal (or to sign-in). */
export function HomeRedirect() {
  const { status, user } = useAuth();
  if (status === "loading") return null;
  return <Navigate to={user ? HOME_BY_ROLE[user.role] : ROUTES.auth.login} replace />;
}
