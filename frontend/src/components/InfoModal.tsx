import { Button, Modal } from "animal-island-ui";
import { CloseIcon } from "naive-icons";
import { useTranslation } from "react-i18next";
import type { Dispatch, ReactNode, SetStateAction } from "react";

interface InfoModalProps {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  title: string;
  children: ReactNode;
}

export function InfoModal({
  showModal,
  setShowModal,
  title,
  children,
}: InfoModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={showModal}
      variant="game"
      title={title}
      width={880}
      typewriter={false}
      footer={
        <div className="modal-action-footer">
          <Button
            type="text"
            size="small"
            icon={<CloseIcon aria-hidden="true" />}
            onClick={() => setShowModal(false)}
          >
            {t("Close")}
          </Button>
        </div>
      }
      onClose={() => setShowModal(false)}
    >
      <div className="modal-scroll">{children}</div>
    </Modal>
  );
}
