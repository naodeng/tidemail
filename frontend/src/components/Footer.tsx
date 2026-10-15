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
        <a href="https://like.do" target="_blank" rel="noreferrer">
          <img src="/likedo.svg" width="24" height="24" alt="LikeDo" />
        </a>
        <a href="https://attachready.com" target="_blank" rel="noreferrer">
          <img
            src="/attachready.png"
            width="24"
            height="24"
            alt="AttachReady"
          />
        </a>
        <a href="mailto:qa@naodeng.com.cn" aria-label="Email">
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
