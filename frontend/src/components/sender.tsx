import { useState } from "react";
import { Button, Input, Modal, Select, Tag } from "animal-island-ui";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useConfig } from "../hooks/useConfig";

interface SenderModalProps {
  senderEmail: string;
  mailboxToken: string;
  open: boolean;
  onClose: () => void;
}

export function SenderModal({
  senderEmail,
  mailboxToken,
  open,
  onClose,
}: SenderModalProps) {
  const { t } = useTranslation();
  const config = useConfig();
  const [isSending, setIsSending] = useState(false);
  const [contentType, setContentType] = useState("text/plain");
  const hasSender = Boolean(
    config.sendChannel && config.senderEmail && mailboxToken,
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSending(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      senderName: formData.get("senderName") as string,
      receiverEmail: formData.get("receiverEmail") as string,
      subject: formData.get("subject") as string,
      content: formData.get("content") as string,
      type: contentType,
    };

    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mailboxToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => ({}))) as {
        code?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(
          data.code ? t(data.code) : data.message || t("Failed to send email"),
        );
      }

      form.reset();
      setContentType("text/plain");
      onClose();
      toast.success(t("Message sent"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("Failed to send email"),
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      open={open}
      variant="game"
      title={t("Send email")}
      width={700}
      typewriter={false}
      footer={
        <div className="modal-action-footer">
          <Button
            type="text"
            size="small"
            onClick={onClose}
            disabled={isSending}
          >
            {t("Cancel")}
          </Button>
        </div>
      }
      onClose={onClose}
    >
      <div className="modal-form-content">
        <p>{t("Forward only, no storage")}</p>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-form__row">
            <label className="form-field">
              {t("Sending email *")}
              <Input
                value={config.senderEmail ?? ""}
                type="email"
                name="fromEmail"
                readOnly
                title={`${t("Reply-To:")} ${senderEmail}`}
                aria-label={t("Sending email *")}
              />
            </label>
            <label className="form-field">
              {t("Sending name")}
              <Input
                type="text"
                name="senderName"
                aria-label={t("Sending name")}
              />
            </label>
          </div>
          <div className="modal-form__row">
            <label className="form-field">
              {t("Recipient email *")}
              <Input
                type="email"
                name="receiverEmail"
                required
                aria-label={t("Recipient email *")}
              />
            </label>
            <label className="form-field">
              {t("Email subject *")}
              <Input
                type="text"
                name="subject"
                required
                aria-label={t("Email subject *")}
              />
            </label>
          </div>
          <label className="form-field">
            {t("Email format")}
            <Select
              options={[
                { key: "text/plain", label: t("Plain text") },
                { key: "text/html", label: t("HTML") },
              ]}
              value={contentType}
              onChange={setContentType}
              aria-label={t("Email format")}
            />
          </label>
          <label className="form-field">
            {t("Email content *")}
            <textarea
              className="app-textarea"
              name="content"
              aria-label={t("Email content *")}
              required
            />
          </label>

          {hasSender ? (
            <Button
              type="primary"
              block
              htmlType="submit"
              disabled={isSending}
              loading={isSending}
            >
              {isSending ? t("Sending...") : t("Send")}
            </Button>
          ) : (
            <Tag variant="dashed" color="brown">
              {t("No sending service configured")}
            </Tag>
          )}
          <p className="form-note">
            {t(
              "Please do not send illegal content such as politics, pornography, etc",
            )}
            .
          </p>
        </form>
      </div>
    </Modal>
  );
}
