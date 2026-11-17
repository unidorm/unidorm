import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Fonts are bundled with the app (no Google Fonts request), with Cyrillic-ext for Kazakh letters.
import "@fontsource-variable/nunito";
import "@fontsource-variable/unbounded";

import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
