import { Outlet } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Toaster } from "react-hot-toast";

export function Layout() {
  return (
    <div className="app-shell">
      <Header />
      <Outlet />
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--animal-bg-color-secondary)",
            color: "var(--animal-text-color)",
            border: "1px solid var(--animal-border-color-light)",
            borderRadius: "var(--animal-border-radius-lg)",
            boxShadow: "var(--animal-shadow-base)",
          },
        }}
      />
    </div>
  );
}
