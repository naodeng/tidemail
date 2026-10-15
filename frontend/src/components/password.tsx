import { useState } from "react";
import { Button, Input, Modal } from "animal-island-ui";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface PasswordModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (password: string) => Promise<void>;
  isLoggingIn: boolean;
}

export function PasswordModal({
  open,
  onClose,
  onLogin,
  isLoggingIn,
}: PasswordModalProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password) {
      toast.error(t("Password is required"));
      return;
    }
    await onLogin(password);
  };

  return (
    <Modal
      open={open}
      variant="game"
      title={t("Save password")}
      width={520}
      typewriter={false}
      footer={
        <div className="modal-action-footer">
          <Button
            type="text"
            size="small"
            onClick={onClose}
            disabled={isLoggingIn}
          >
            {t("Cancel")}
          </Button>
        </div>
      }
      onClose={onClose}
    >
      <div className="modal-form-content">
        <p>{t("Save your password and continue using this email in 1 day")}</p>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="form-field">
            {t("Enter your password *")}
            <Input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-label={t("Enter your password *")}
            />
          </label>
          <p>
            {t(
              "How to get a password? Click to create a temporary email and receive at least one email to generate a password",
            )}
            .
          </p>
          <p>
            {t(
              "Remember your password, otherwise your email will expire and cannot be retrieved",
            )}
            .
          </p>
          <Button
            type="primary"
            block
            htmlType="submit"
            disabled={isLoggingIn}
            loading={isLoggingIn}
          >
            {isLoggingIn ? t("Submitting...") : t("Login")}
          </Button>
        </form>
      </div>
    </Modal>
  );
}
