import { Navigate, Outlet, useLocation } from "react-router-dom";

import { LoadingState } from "../components/ui";
import { ROUTES } from "../config/routes";
import { useAuth } from "../context/AuthContext";

/** Lets only a signed-in student through; everyone else goes to the sign-in page and comes back afterwards. */
export default function RequireStudent() {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="grid min-h-full place-items-center bg-page">
        <LoadingState label="Checking your session…" />
      </div>
    );
  }
  if (status === "signed-out" || !user) {
    return <Navigate to={ROUTES.auth.login} replace state={{ from: location.pathname + location.search }} />;
  }
  if (user.role !== "student") {
    return <Navigate to={ROUTES.manager.root} replace />;
  }
  return <Outlet />;
}
