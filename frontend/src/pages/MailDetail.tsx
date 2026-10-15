import { useTranslation } from "react-i18next";
import { enUS, zhCN } from "date-fns/locale";
import { format } from "date-fns/format";
import { UserIcon } from "naive-icons";
import type { Email } from "../database_types";

interface MailDetailProps {
  email: Email;
}

export function MailDetail({ email }: MailDetailProps) {
  const { t, i18n } = useTranslation();
  const locale = (i18n.resolvedLanguage ?? i18n.language).startsWith("zh")
    ? zhCN
    : enUS;
  const senderName = email.from?.name || email.messageFrom;
  const sentAt = email.date || email.createdAt;

  return (
    <article className="mail-detail">
      <header className="mail-detail-header">
        <div className="mail-detail-header__sender">
          <UserIcon size={24} aria-hidden="true" />
          <div>
            <strong>{senderName}</strong>
            <p>{email.subject}</p>
            <p>
              <span>{t("Reply-To:")}</span> {email.from?.address}
            </p>
          </div>
        </div>
        <time dateTime={new Date(sentAt).toISOString()}>
          {format(new Date(sentAt), "PPpp", { locale })}
        </time>
      </header>

      <iframe
        srcDoc={email.html || `<pre>${email.text || ""}</pre>`}
        className="mail-detail-frame"
        sandbox="allow-popups"
        title={t("Email content")}
      />
    </article>
  );
}
