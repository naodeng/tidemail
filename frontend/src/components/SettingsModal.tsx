import { Button, Modal } from "animal-island-ui";
import { ChevronDownIcon, CloseIcon } from "naive-icons";
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
      footer={
        <div className="modal-action-footer">
          <Button
            type="text"
            size="small"
            icon={<CloseIcon aria-hidden="true" />}
            onClick={onClose}
          >
            {t("Close")}
          </Button>
        </div>
      }
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
            <div className="settings-modal__select">
              <select
                aria-labelledby="settings-language-label"
                className="settings-modal__select-input"
                value={currentLanguage}
                onChange={(event) =>
                  void i18n.changeLanguage(event.currentTarget.value)
                }
              >
                {languages.map(({ key, label }) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon aria-hidden="true" />
            </div>
          </div>

          <div className="settings-modal__field">
            <span id="settings-theme-label" className="settings-modal__label">
              {t("Theme")}
            </span>
            <div className="settings-modal__select">
              <select
                aria-labelledby="settings-theme-label"
                className="settings-modal__select-input"
                value={preference}
                onChange={(event) =>
                  setPreference(event.currentTarget.value as ThemePreference)
                }
              >
                <option value="system">{t("System default")}</option>
                <option value="light">{t("Light")}</option>
                <option value="dark">{t("Dark")}</option>
              </select>
              <ChevronDownIcon aria-hidden="true" />
            </div>
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
