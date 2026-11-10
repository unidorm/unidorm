import { Navigate, Route, Routes } from "react-router-dom";

import { ROUTES } from "../config/routes";
import PortalLayout from "../layouts/PortalLayout";
import DashboardPage from "../pages/manager/DashboardPage";
import FeedbackPage from "../pages/manager/FeedbackPage";
import RelocationsPage from "../pages/manager/RelocationsPage";
import RoomsPage from "../pages/manager/RoomsPage";
import NotFoundPage from "../pages/shared/NotFoundPage";
import AccommodationPage from "../pages/student/AccommodationPage";
import DocumentsPage from "../pages/student/DocumentsPage";
import HelpPage from "../pages/student/HelpPage";
import PaymentsPage from "../pages/student/PaymentsPage";
import RoommateMatchingPage from "../pages/student/RoommateMatchingPage";
import StudentHomePage from "../pages/student/StudentHomePage";

// The two portals share PortalLayout and differ only by the `portal` prop.
// Role guards come with authentication in a later stage.
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.student.home} replace />} />

      <Route path={ROUTES.student.root} element={<Navigate to={ROUTES.student.home} replace />} />
      <Route element={<PortalLayout portal="student" />}>
        <Route path={ROUTES.student.home} element={<StudentHomePage />} />
        <Route path={ROUTES.student.accommodation} element={<AccommodationPage />} />
        <Route path={ROUTES.student.roommateMatching} element={<RoommateMatchingPage />} />
        <Route path={ROUTES.student.documents} element={<DocumentsPage />} />
        <Route path={ROUTES.student.payments} element={<PaymentsPage />} />
        <Route path={ROUTES.student.help} element={<HelpPage />} />
      </Route>

      <Route path={ROUTES.manager.root} element={<Navigate to={ROUTES.manager.rooms} replace />} />
      <Route element={<PortalLayout portal="manager" />}>
        <Route path={ROUTES.manager.rooms} element={<RoomsPage />} />
        <Route path={ROUTES.manager.dashboard} element={<DashboardPage />} />
        <Route path={ROUTES.manager.feedback} element={<FeedbackPage />} />
        <Route path={ROUTES.manager.relocations} element={<RelocationsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
