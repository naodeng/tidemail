import { useState } from "react";
import { Button, Select } from "animal-island-ui";
import { MailIcon, MenuIcon } from "naive-icons";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { About } from "../pages/About.tsx";
import { Privacy } from "../pages/Privacy.tsx";
import { Terms } from "../pages/Terms.tsx";
import { InfoModal } from "./InfoModal.tsx";
import { useTheme, type ThemePreference } from "../hooks/useTheme.tsx";

const languages = [
  { code: "zh", name: "简体中文" },
  { code: "en", name: "English" },
];

export function Header() {
  const { t, i18n } = useTranslation();
  const { preference, setPreference } = useTheme();
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const currentLanguage =
    languages.find(({ code }) => code === i18n.language) ??
    languages.find(({ code }) => i18n.language.startsWith(`${code}-`)) ??
    languages[0];

  const renderLanguageSelect = () => (
    <div className="site-language-select">
      <Select
        aria-label={t("Language")}
        options={languages.map(({ code, name }) => ({
          key: code,
          label: name,
        }))}
        value={currentLanguage.code}
        onChange={(code) => void i18n.changeLanguage(code)}
      />
    </div>
  );

  const renderThemeSelect = () => (
    <div className="site-theme-select">
      <Select
        aria-label={t("Theme")}
        options={[
          { key: "system", label: t("System default") },
          { key: "light", label: t("Light") },
          { key: "dark", label: t("Dark") },
        ]}
        value={preference}
        onChange={(value) =>
          setPreference(value as ThemePreference)
        }
      />
    </div>
  );

  const legalLinks = (
    <>
      <Button type="text" size="small" onClick={() => setShowAboutModal(true)}>
        {t("About")}
      </Button>
      <Button
        type="text"
        size="small"
        onClick={() => setShowPrivacyModal(true)}
      >
        {t("Privacy")}
      </Button>
      <Button type="text" size="small" onClick={() => setShowTermsModal(true)}>
        {t("Terms")}
      </Button>
    </>
  );

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <Link to="/" className="site-brand">
            <MailIcon
              className="site-brand__icon"
              size={30}
              aria-hidden="true"
            />
            <span>TideMail</span>
          </Link>

          <nav className="site-nav" aria-label="Main navigation">
            <div className="site-nav__links">
              {legalLinks}
              <a
                className="site-github-link"
                href="https://github.com/naodeng/vmail"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </div>

            <div className="site-nav__preferences site-nav__preferences--desktop">
              {renderLanguageSelect()}
              {renderThemeSelect()}
            </div>

            <Button
              className="site-nav__mobile-toggle"
              type="text"
              size="small"
              icon={<MenuIcon aria-hidden="true" />}
              aria-label={t("Open navigation menu")}
              aria-expanded={showMobileMenu}
              onClick={() => setShowMobileMenu((visible) => !visible)}
            />

            {showMobileMenu && (
              <div className="site-nav__mobile-links">
                {legalLinks}
                <a
                  href="https://github.com/naodeng/vmail"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                <div className="site-nav__mobile-preferences">
                  {renderLanguageSelect()}
                  {renderThemeSelect()}
                </div>
              </div>
            )}
          </nav>
        </div>
      </header>

      <InfoModal
        showModal={showAboutModal}
        setShowModal={setShowAboutModal}
        title={t("About")}
      >
        <About />
      </InfoModal>
      <InfoModal
        showModal={showPrivacyModal}
        setShowModal={setShowPrivacyModal}
        title={t("Privacy")}
      >
        <Privacy />
      </InfoModal>
      <InfoModal
        showModal={showTermsModal}
        setShowModal={setShowTermsModal}
        title={t("Terms")}
      >
        <Terms />
      </InfoModal>
    </>
  );
}
