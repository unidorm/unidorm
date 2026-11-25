import { Navigate, Route, Routes } from "react-router-dom";

import { ROUTES } from "../config/routes";
import PortalLayout from "../layouts/PortalLayout";
import DashboardPage from "../pages/manager/DashboardPage";
import FeedbackPage from "../pages/manager/FeedbackPage";
import RelocationsPage from "../pages/manager/RelocationsPage";
import ComparePage from "../pages/manager/ComparePage";
import RoomGroupPage from "../pages/manager/RoomGroupPage";
import RoomsPage from "../pages/manager/RoomsPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import NotFoundPage from "../pages/shared/NotFoundPage";
import AccommodationPage from "../pages/student/AccommodationPage";
import DocumentsPage from "../pages/student/DocumentsPage";
import HelpPage from "../pages/student/HelpPage";
import PaymentsPage from "../pages/student/PaymentsPage";
import RoommateMatchingPage from "../pages/student/RoommateMatchingPage";
import MatchingResultsPage from "../pages/student/MatchingResultsPage";
import StudentHomePage from "../pages/student/StudentHomePage";
import SurveyPage from "../pages/student/SurveyPage";
import SurveyReviewPage from "../pages/student/SurveyReviewPage";
import RequireRole, { HomeRedirect } from "./RequireRole";

// The two portals share PortalLayout and differ only by the `portal` prop.
// Each portal needs a signed-in user with the matching role (RequireRole).
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route path={ROUTES.auth.login} element={<LoginPage />} />
      <Route path={ROUTES.auth.register} element={<RegisterPage />} />

      <Route path={ROUTES.student.root} element={<Navigate to={ROUTES.student.home} replace />} />
      <Route element={<RequireRole role="student" />}>
        <Route element={<PortalLayout portal="student" />}>
          <Route path={ROUTES.student.home} element={<StudentHomePage />} />
          <Route path={ROUTES.student.accommodation} element={<AccommodationPage />} />
          <Route path={ROUTES.student.roommateMatching} element={<RoommateMatchingPage />} />
          <Route path={ROUTES.student.survey} element={<SurveyPage />} />
          <Route path={ROUTES.student.surveyReview} element={<SurveyReviewPage />} />
          <Route path={ROUTES.student.matchingResults} element={<MatchingResultsPage />} />
          <Route path={ROUTES.student.documents} element={<DocumentsPage />} />
          <Route path={ROUTES.student.payments} element={<PaymentsPage />} />
          <Route path={ROUTES.student.help} element={<HelpPage />} />
        </Route>
      </Route>

      <Route path={ROUTES.manager.root} element={<Navigate to={ROUTES.manager.rooms} replace />} />
      <Route element={<RequireRole role="housing_manager" />}>
        <Route element={<PortalLayout portal="manager" />}>
          <Route path={ROUTES.manager.rooms} element={<RoomsPage />} />
          <Route path={ROUTES.manager.roomGroup} element={<RoomGroupPage />} />
          <Route path={ROUTES.manager.compare} element={<ComparePage />} />
          <Route path={ROUTES.manager.dashboard} element={<DashboardPage />} />
          <Route path={ROUTES.manager.feedback} element={<FeedbackPage />} />
          <Route path={ROUTES.manager.relocations} element={<RelocationsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
