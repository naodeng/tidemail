import { useTranslation } from "react-i18next";
import { formatDistanceToNow, type Locale } from "date-fns";
import { enUS, zhCN } from "date-fns/locale";
import { Badge, Button, Checkbox, Skeleton } from "animal-island-ui";
import {
  ArrowLeftIcon,
  InboxIcon,
  KeyIcon,
  MailIcon,
  MaximizeIcon,
  RefreshIcon,
  SendIcon,
  TrashIcon,
} from "naive-icons";
import type { Dispatch, SetStateAction } from "react";
import type { Email } from "../database_types";
import { MailDetail } from "../pages/MailDetail";

const localeMap: Record<string, Locale> = {
  zh: zhCN,
  en: enUS,
};

interface MailListProps {
  emails: Email[];
  isLoading: boolean;
  isFetching: boolean;
  onDelete: (ids: string[]) => void;
  isDeleting: boolean;
  onRefresh: () => void;
  selectedIds: string[];
  setSelectedIds: Dispatch<SetStateAction<string[]>>;
  isAddressCreated: boolean;
  onSelectEmail: (email: Email) => void;
  showViewPasswordButton: boolean;
  onShowPassword: () => void;
  selectedEmail: Email | null;
  onCloseDetail: () => void;
  onExpand: () => void;
  canSendEmails: boolean;
  onOpenSender: () => void;
}

export function MailList({
  emails,
  isLoading,
  isFetching,
  onDelete,
  isDeleting,
  onRefresh,
  selectedIds,
  setSelectedIds,
  isAddressCreated,
  onSelectEmail,
  showViewPasswordButton,
  onShowPassword,
  selectedEmail,
  onCloseDetail,
  onExpand,
  canSendEmails,
  onOpenSender,
}: MailListProps) {
  const { t, i18n } = useTranslation();
  const currentLocale =
    localeMap[i18n.resolvedLanguage ?? i18n.language] ?? enUS;
  const allSelected = emails.length > 0 && selectedIds.length === emails.length;

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds((previous) =>
      selected
        ? previous.includes(id)
          ? previous
          : [...previous, id]
        : previous.filter((item) => item !== id),
    );
  };

  const handleSelectAll = (values: Array<string | number>) => {
    setSelectedIds(values.includes("all") ? emails.map(({ id }) => id) : []);
  };

  const renderBody = () => {
    if (selectedEmail) {
      return <MailDetail email={selectedEmail} />;
    }

    if (!isAddressCreated) {
      return (
        <div className="mail-empty-state" role="status">
          <InboxIcon
            className="mail-empty-state__icon"
            size={38}
            aria-hidden="true"
          />
          <p>{t("Create a temporary address to receive mail")}</p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="mail-list-items" aria-hidden="true">
          <Skeleton variant="paragraph" rows={2} />
          <Skeleton variant="paragraph" rows={2} />
        </div>
      );
    }

    if (emails.length === 0) {
      return (
        <div className="mail-empty-state" role="status">
          <InboxIcon
            className="mail-empty-state__icon"
            size={38}
            aria-hidden="true"
          />
          <p>{t("Waiting for emails...")}</p>
        </div>
      );
    }

    return (
      <div className="mail-list-items">
        {emails.map((email) => (
          <div className="mail-item-row" key={email.id}>
            <Checkbox
              size="small"
              options={[
                {
                  value: email.id,
                  label: (
                    <span className="sr-only">
                      {email.from?.name || email.messageFrom}: {email.subject}
                    </span>
                  ),
                },
              ]}
              value={selectedIds.includes(email.id) ? [email.id] : []}
              onChange={(values) =>
                handleSelect(email.id, values.includes(email.id))
              }
            />
            <Button
              type="default"
              block
              className="mail-item"
              onClick={() => onSelectEmail(email)}
            >
              <span className="mail-item__content">
                <span className="mail-item__heading">
                  <strong>{email.from?.name || email.messageFrom}</strong>
                  <span className="mail-item__meta">
                    <span className="mail-item__sender">
                      {email.from?.address}
                    </span>
                    <time
                      className="mail-item__date"
                      dateTime={new Date(
                        email.date || email.createdAt,
                      ).toISOString()}
                    >
                      {formatDistanceToNow(
                        new Date(email.date || email.createdAt),
                        { addSuffix: true, locale: currentLocale },
                      )}
                    </time>
                  </span>
                </span>
                <span className="mail-item__subject">{email.subject}</span>
                <span className="mail-item__preview">
                  {(email.text || email.html || "").substring(0, 300)}
                </span>
              </span>
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="surface-panel inbox-card" aria-label={t("Inbox")}>
      <div className="mail-list-header">
        <div className="mail-list-header__title">
          <MailIcon size={22} aria-hidden="true" />
          <h2>{t("Inbox")}</h2>
          {isAddressCreated && emails.length > 0 && !selectedEmail && (
            <Badge count={emails.length} color="app-teal" />
          )}
          {selectedEmail && (
            <Button
              type="text"
              size="small"
              icon={<ArrowLeftIcon aria-hidden="true" />}
              onClick={onCloseDetail}
            >
              {t("Return to email list")}
            </Button>
          )}
        </div>

        <div className="mail-list-header__actions">
          {selectedEmail ? (
            <>
              <Button
                type="text"
                size="small"
                icon={<MaximizeIcon aria-hidden="true" />}
                title={t("Expand")}
                aria-label={t("Expand")}
                onClick={onExpand}
              />
              <Button
                type="primary"
                size="small"
                danger
                icon={<TrashIcon aria-hidden="true" />}
                title={t("Delete")}
                aria-label={t("Delete")}
                disabled={isDeleting}
                onClick={() => onDelete([selectedEmail.id])}
              />
            </>
          ) : (
            <>
              {showViewPasswordButton && (
                <Button
                  type="text"
                  size="small"
                  icon={<KeyIcon aria-hidden="true" />}
                  title={t("View password")}
                  aria-label={t("View password")}
                  onClick={onShowPassword}
                />
              )}
              {canSendEmails && (
                <Button
                  type="text"
                  size="small"
                  icon={<SendIcon aria-hidden="true" />}
                  title={t("Send email")}
                  aria-label={t("Send email")}
                  onClick={onOpenSender}
                />
              )}
              {isAddressCreated && emails.length > 0 && (
                <>
                  <Checkbox
                    size="small"
                    options={[{ value: "all", label: t("Select all") }]}
                    value={allSelected ? ["all"] : []}
                    onChange={handleSelectAll}
                  />
                  <Button
                    type="primary"
                    size="small"
                    danger
                    icon={<TrashIcon aria-hidden="true" />}
                    title={t("Delete selected")}
                    aria-label={t("Delete selected")}
                    disabled={selectedIds.length === 0 || isDeleting}
                    onClick={() => onDelete(selectedIds)}
                  />
                </>
              )}
              <Button
                type="text"
                size="small"
                icon={<RefreshIcon aria-hidden="true" />}
                title={t("Refresh")}
                aria-label={t("Refresh")}
                onClick={onRefresh}
                disabled={!isAddressCreated || isFetching}
              />
            </>
          )}
        </div>
      </div>
      <div className="mail-list-body">{renderBody()}</div>
    </section>
  );
}
