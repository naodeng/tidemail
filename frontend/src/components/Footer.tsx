import { Link } from "react-router-dom";
import { MailIcon } from "naive-icons";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="site-footer">
      <div>
        <Link to="/" className="site-brand">
          tidemail
        </Link>
        <p>
          © {new Date().getFullYear()}{" "}
          <a href="https://naodeng.com.cn/" target="_blank" rel="noreferrer">
            naodeng
          </a>{" "}
          {t("All Rights Reserved.")}
        </p>
      </div>

      <nav className="site-footer__links" aria-label={t("Social links")}>
        <a href="mailto:qa@naodeng.com.cn" aria-label={t("Email us")}>
          <MailIcon size={22} aria-hidden="true" />
        </a>
        <a href="https://twitter.com/inaodeng" target="_blank" rel="noreferrer">
          Twitter
        </a>
        <a
          href="https://github.com/naodeng/tidemail"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </nav>
    </footer>
  );
}
