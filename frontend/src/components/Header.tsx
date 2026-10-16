import { useEffect, useRef, useState } from "react";
import { Button } from "animal-island-ui";
import { MailIcon, MenuIcon, SettingsIcon } from "naive-icons";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { About } from "../pages/About.tsx";
import { Privacy } from "../pages/Privacy.tsx";
import { Terms } from "../pages/Terms.tsx";
import { InfoModal } from "./InfoModal.tsx";
import { SettingsModal } from "./SettingsModal.tsx";

export function Header() {
  const { t } = useTranslation();
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!showMobileMenu) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [showMobileMenu]);

  const legalLinks = (
    <>
      <Button
        type="text"
        size="small"
        onClick={() => {
          toast.dismiss();
          setShowAboutModal(true);
          setShowMobileMenu(false);
        }}
      >
        {t("About")}
      </Button>
      <Button
        type="text"
        size="small"
        onClick={() => {
          toast.dismiss();
          setShowPrivacyModal(true);
          setShowMobileMenu(false);
        }}
      >
        {t("Privacy")}
      </Button>
      <Button
        type="text"
        size="small"
        onClick={() => {
          toast.dismiss();
          setShowTermsModal(true);
          setShowMobileMenu(false);
        }}
      >
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
            <span>tidemail</span>
          </Link>

          <nav
            ref={navRef}
            className="site-nav"
            aria-label={t("Main navigation")}
            onKeyDown={(event) => {
              if (event.key === "Escape") setShowMobileMenu(false);
            }}
          >
            <div className="site-nav__links">
              {legalLinks}
              <a
                className="site-github-link"
                href="https://github.com/naodeng/tidemail"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </div>

            <Button
              className="site-settings-trigger"
              type="text"
              size="small"
              icon={<SettingsIcon aria-hidden="true" />}
              aria-label={t("Settings")}
              aria-haspopup="dialog"
              onClick={() => {
                toast.dismiss();
                setShowMobileMenu(false);
                setShowSettingsModal(true);
              }}
            >
              <span className="site-settings-trigger__label">
                {t("Settings")}
              </span>
            </Button>

            <Button
              className="site-nav__mobile-toggle"
              type="text"
              size="small"
              icon={<MenuIcon aria-hidden="true" />}
              aria-label={t(
                showMobileMenu
                  ? "Close navigation menu"
                  : "Open navigation menu",
              )}
              aria-expanded={showMobileMenu}
              aria-controls={showMobileMenu ? "mobile-navigation" : undefined}
              onClick={() => setShowMobileMenu((visible) => !visible)}
            />

            {showMobileMenu && (
              <div className="site-nav__mobile-links" id="mobile-navigation">
                {legalLinks}
                <a
                  href="https://github.com/naodeng/tidemail"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowMobileMenu(false)}
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
      <SettingsModal
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </>
  );
}
