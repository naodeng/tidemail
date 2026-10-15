import { useEffect, useState } from "react";
import { Button, Countdown } from "animal-island-ui";
import { ClockIcon, RefreshIcon } from "naive-icons";
import { useTranslation } from "react-i18next";

interface CountdownTimerProps {
  expiryTimestamp: number;
  onReset: () => void;
}

export function CountdownTimer({
  expiryTimestamp,
  onReset,
}: CountdownTimerProps) {
  const { t } = useTranslation();
  const [expired, setExpired] = useState(() => expiryTimestamp <= Date.now());

  useEffect(() => {
    setExpired(expiryTimestamp <= Date.now());
  }, [expiryTimestamp]);

  return (
    <div className="countdown-row">
      <span className="countdown-row__label">
        <ClockIcon size={20} aria-hidden="true" />
        {expired ? (
          t("Email expired")
        ) : (
          <>
            {t("Expires in")}
            <Countdown
              value={expiryTimestamp}
              format="HH:mm:ss"
              size="small"
              variant="island"
              bordered
              onFinish={() => setExpired(true)}
            />
          </>
        )}
      </span>
      {!expired && (
        <Button
          type="text"
          size="small"
          icon={<RefreshIcon aria-hidden="true" />}
          title={t("Reset validity")}
          aria-label={t("Reset validity")}
          onClick={onReset}
        />
      )}
    </div>
  );
}
