import { Modal } from "animal-island-ui";
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
  return (
    <Modal
      open={showModal}
      variant="game"
      title={title}
      width={880}
      typewriter={false}
      onClose={() => setShowModal(false)}
    >
      <div className="modal-scroll">{children}</div>
    </Modal>
  );
}
