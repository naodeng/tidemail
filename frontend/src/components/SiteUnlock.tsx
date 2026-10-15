import { useState } from "react";
import { Button, Input } from "animal-island-ui";
import { LockIcon } from "naive-icons";
import { useTranslation } from "react-i18next";

interface SiteUnlockProps {
  onUnlock: (password: string) => Promise<void>;
  isUnlocking: boolean;
  error: string | null;
}

export function SiteUnlock({ onUnlock, isUnlocking, error }: SiteUnlockProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.trim()) await onUnlock(password);
  };

  return (
    <main className="app-loading">
      <section className="surface-panel site-unlock-card">
        <h1>{t("Site locked")}</h1>
        <p>{t("Enter site password to continue")}</p>
        <form onSubmit={handleSubmit}>
          <label className="form-field">
            {t("Password")}
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              prefix={<LockIcon aria-hidden="true" />}
              aria-label={t("Password")}
            />
          </label>
          {error && <p role="alert">{error}</p>}
          <Button
            type="primary"
            block
            htmlType="submit"
            disabled={isUnlocking || !password.trim()}
            loading={isUnlocking}
          >
            {isUnlocking ? t("Unlocking...") : t("Unlock")}
          </Button>
        </form>
      </section>
    </main>
  );
}
