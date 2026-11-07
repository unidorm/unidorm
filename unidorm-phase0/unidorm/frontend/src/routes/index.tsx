import { Route, Routes } from "react-router-dom";

import NotFoundPage from "../pages/shared/NotFoundPage";
import PlaceholderPage from "../pages/shared/PlaceholderPage";

// Student and manager routes (with layouts and role guards) are added in later phases.
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PlaceholderPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
