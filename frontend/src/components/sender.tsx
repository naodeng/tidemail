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
      title="tidemail Sender"
      width={700}
      typewriter={false}
      onClose={onClose}
    >
      <div className="modal-form-content">
        <p>{t("Forward only, no storage")}</p>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-form__row">
            <Input
              value={config.senderEmail ?? ""}
              type="email"
              name="fromEmail"
              placeholder={t("Sending email *")}
              readOnly
              title={`${t("Reply-To:")} ${senderEmail}`}
              aria-label={t("Sending email *")}
            />
            <Input
              type="text"
              name="senderName"
              placeholder={t("Sending name")}
              aria-label={t("Sending name")}
            />
          </div>
          <div className="modal-form__row">
            <Input
              type="email"
              name="receiverEmail"
              placeholder={t("Recipient email *")}
              required
              aria-label={t("Recipient email *")}
            />
            <Input
              type="text"
              name="subject"
              placeholder={t("Email subject *")}
              required
              aria-label={t("Email subject *")}
            />
          </div>
          <label className="form-field">
            Email format
            <Select
              options={[
                { key: "text/plain", label: "Plain text" },
                { key: "text/html", label: "HTML" },
              ]}
              value={contentType}
              onChange={setContentType}
              aria-label="Email format"
            />
          </label>
          <label className="form-field">
            {t("Email content *")}
            <textarea
              className="app-textarea"
              name="content"
              placeholder={t("Email content *")}
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
