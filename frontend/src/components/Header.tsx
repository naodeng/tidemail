import { useState } from "react";
import { Button, Select } from "animal-island-ui";
import { MailIcon, MenuIcon } from "naive-icons";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { About } from "../pages/About.tsx";
import { Privacy } from "../pages/Privacy.tsx";
import { Terms } from "../pages/Terms.tsx";
import { InfoModal } from "./InfoModal.tsx";

const languages = [
  { code: "zh", name: "简体中文" },
  { code: "en", name: "English" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Português" },
  { code: "ru", name: "Русский" },
  { code: "tr", name: "Türkçe" },
  { code: "zh-TW", name: "繁體中文" },
];

export function Header() {
  const { t, i18n } = useTranslation();
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const currentLanguage =
    languages.find(({ code }) => code === i18n.language) ??
    languages.find(({ code }) => i18n.language.startsWith(`${code}-`)) ??
    languages[0];

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
              <Link to="/api-docs" className="site-nav__api-link">
                {t("API Documentation")}
              </Link>
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

            <div className="site-language-select">
              <Select
                aria-label="Language"
                options={languages.map(({ code, name }) => ({
                  key: code,
                  label: name,
                }))}
                value={currentLanguage.code}
                onChange={(code) => void i18n.changeLanguage(code)}
              />
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
                <Link to="/api-docs" onClick={() => setShowMobileMenu(false)}>
                  {t("API Documentation")}
                </Link>
                {legalLinks}
                <a
                  href="https://github.com/naodeng/vmail"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
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
