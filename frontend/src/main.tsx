import React from "react";
import ReactDOM from "react-dom/client";
import App, { LoadingScreen } from "./App.tsx";
import "./index.css";
import "animal-island-ui/style";
import "./i18n.ts";
import { ThemeProvider } from "./hooks/useTheme.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <React.Suspense fallback={<LoadingScreen />}>
        <App />
      </React.Suspense>
    </ThemeProvider>
  </React.StrictMode>,
);
