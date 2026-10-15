import { Link } from "react-router-dom";
import { MailIcon } from "naive-icons";

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <Link to="/" className="site-brand">
          TideMail
        </Link>
        <p>
          © {new Date().getFullYear()} Products of{" "}
          <a href="https://naodeng.com.cn/" target="_blank" rel="noreferrer">
            naodeng.com.cn
          </a>
        </p>
      </div>

      <nav className="site-footer__links" aria-label="Social links">
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
          href="https://github.com/naodeng/vmail"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </nav>
    </footer>
  );
}
