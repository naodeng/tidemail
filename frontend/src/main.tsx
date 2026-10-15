import React from "react";
import ReactDOM from "react-dom/client";
import App, { LoadingScreen } from "./App.tsx";
import "./index.css";
import "animal-island-ui/style";
import "./i18n.ts";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <React.Suspense fallback={<LoadingScreen />}>
      <App />
    </React.Suspense>
  </React.StrictMode>,
);
