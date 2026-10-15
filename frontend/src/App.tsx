import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Card, Skeleton } from "animal-island-ui";
import axios from "axios";
import { lazy, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ConfigContext, AppConfig } from "./hooks/useConfig.ts";
import { getUnlockStatus, unlockSite } from "./services/api.ts";
import { SiteUnlock } from "./components/SiteUnlock.tsx";
import { Layout } from "./Layout.tsx";

const Home = lazy(() =>
  import("./pages/Home.tsx").then((module) => ({ default: module.Home })),
);

const queryClient = new QueryClient();

export function LoadingScreen() {
  return (
    <main className="app-loading" role="status" aria-label="Loading">
      <Card className="app-loading-card">
        <Skeleton variant="paragraph" rows={3} />
        <p>Loading tidemail…</p>
      </Card>
    </main>
  );
}

function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    axios.get<AppConfig>("/config").then((res) => {
      setConfig(res.data);
    });
  }, []);

  useEffect(() => {
    if (!config) {
      return;
    }

    if (!config.sitePasswordEnabled) {
      setIsUnlocked(true);
      return;
    }

    getUnlockStatus()
      .then((status) => {
        setIsUnlocked(status.unlocked || !status.sitePasswordEnabled);
      })
      .catch(() => {
        setIsUnlocked(false);
      });
  }, [config]);

  const handleUnlock = async (password: string) => {
    setIsUnlocking(true);
    setUnlockError(null);
    try {
      await unlockSite(password);
      setIsUnlocked(true);
    } catch (err: any) {
      setUnlockError(err?.message || "Invalid password");
    } finally {
      setIsUnlocking(false);
    }
  };

  if (!config) {
    return <LoadingScreen />;
  }

  if (!isUnlocked) {
    return (
      <SiteUnlock
        onUnlock={handleUnlock}
        isUnlocking={isUnlocking}
        error={unlockError}
      />
    );
  }

  return (
    <ConfigContext.Provider value={config}>
      {/* 使用 QueryClientProvider 为应用提供 React Query 功能 */}
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ConfigContext.Provider>
  );
}

export default App;
