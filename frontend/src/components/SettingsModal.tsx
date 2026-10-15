import { Modal, Select } from "animal-island-ui";
import packageMetadata from "../../../package.json";
import { useTranslation } from "react-i18next";
import { useTheme, type ThemePreference } from "../hooks/useTheme.tsx";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const languages = [
  { key: "zh", label: "简体中文" },
  { key: "en", label: "English" },
];

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { t, i18n } = useTranslation();
  const { preference, setPreference } = useTheme();
  const currentLanguage = (i18n.resolvedLanguage ?? i18n.language).startsWith(
    "zh",
  )
    ? "zh"
    : "en";

  return (
    <Modal
      open={open}
      variant="game"
      title={t("Settings")}
      width={520}
      typewriter={false}
      footer={null}
      onClose={onClose}
    >
      <div className="settings-modal">
        <section
          className="settings-modal__preferences"
          aria-label={t("Preferences")}
        >
          <div className="settings-modal__field">
            <span
              id="settings-language-label"
              className="settings-modal__label"
            >
              {t("Language")}
            </span>
            <Select
              aria-labelledby="settings-language-label"
              options={languages}
              value={currentLanguage}
              onChange={(language) => void i18n.changeLanguage(language)}
            />
          </div>

          <div className="settings-modal__field">
            <span id="settings-theme-label" className="settings-modal__label">
              {t("Theme")}
            </span>
            <Select
              aria-labelledby="settings-theme-label"
              options={[
                { key: "system", label: t("System default") },
                { key: "light", label: t("Light") },
                { key: "dark", label: t("Dark") },
              ]}
              value={preference}
              onChange={(value) => setPreference(value as ThemePreference)}
            />
          </div>
        </section>

        <section
          className="settings-modal__information"
          aria-label={t("Project information")}
        >
          <div className="settings-modal__information-row">
            <span className="settings-modal__label">{t("Version")}</span>
            <span>v{packageMetadata.version}</span>
          </div>
          <div className="settings-modal__information-row settings-modal__license">
            <span className="settings-modal__label">{t("License")}</span>
            <div>
              <a
                href="https://github.com/naodeng/tidemail/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("GNU General Public License v3.0 only")}
              </a>
              <p>{t("GPL-3.0-only summary")}</p>
            </div>
          </div>
        </section>
      </div>
    </Modal>
  );
}
