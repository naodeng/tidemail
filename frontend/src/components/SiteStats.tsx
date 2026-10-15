import { useEffect, useState } from "react";
import { Card, Skeleton } from "animal-island-ui";
import { CodeIcon, MailIcon, UserIcon, WifiIcon } from "naive-icons";
import { useTranslation } from "react-i18next";
import { getSiteStats, type SiteStats as SiteStatsType } from "../services/api";

const VMAIL_DEV_BASE_STATS = {
  totalAddressesCreated: 56023,
  totalEmailsReceived: 1342678,
  totalApiKeysCreated: 1840,
  totalApiCalls: 15734,
};

function mergeWithBase(stats: SiteStatsType): SiteStatsType {
  if (
    typeof window === "undefined" ||
    window.location.hostname !== "vmail.dev"
  ) {
    return stats;
  }

  return {
    totals: {
      totalAddressesCreated:
        stats.totals.totalAddressesCreated +
        VMAIL_DEV_BASE_STATS.totalAddressesCreated,
      totalEmailsReceived:
        stats.totals.totalEmailsReceived +
        VMAIL_DEV_BASE_STATS.totalEmailsReceived,
      totalApiKeysCreated:
        stats.totals.totalApiKeysCreated +
        VMAIL_DEV_BASE_STATS.totalApiKeysCreated,
      totalApiCalls:
        stats.totals.totalApiCalls + VMAIL_DEV_BASE_STATS.totalApiCalls,
    },
  };
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <Card className="stats-card">
      <span className="stats-card__icon">{icon}</span>
      <strong>{value.toLocaleString()}</strong>
      <span>{label}</span>
    </Card>
  );
}

export function SiteStats() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<SiteStatsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getSiteStats()
      .then((data) => {
        if (active) setStats(mergeWithBase(data));
      })
      .catch((error) => console.error("Failed to fetch site stats:", error))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="stats-grid" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton
            key={index}
            variant="rect"
            widthValue="100%"
            heightValue={112}
          />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="stats-section">
      <div className="stats-grid">
        <StatCard
          icon={<UserIcon className="stats-card__symbol" aria-hidden="true" />}
          label={t("Addresses Created")}
          value={stats.totals.totalAddressesCreated}
        />
        <StatCard
          icon={<MailIcon className="stats-card__symbol" aria-hidden="true" />}
          label={t("Emails Received")}
          value={stats.totals.totalEmailsReceived}
        />
        <StatCard
          icon={<CodeIcon className="stats-card__symbol" aria-hidden="true" />}
          label={t("API Keys Created")}
          value={stats.totals.totalApiKeysCreated}
        />
        <StatCard
          icon={<WifiIcon className="stats-card__symbol" aria-hidden="true" />}
          label={t("API Calls")}
          value={stats.totals.totalApiCalls}
        />
      </div>
      <p className="stats-empty-note">
        {t("Please create a temporary email address first")}
      </p>
    </div>
  );
}
