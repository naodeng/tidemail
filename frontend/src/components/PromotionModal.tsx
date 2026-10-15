import { Card, Modal } from "animal-island-ui";
import { ExternalLinkIcon, GiftIcon } from "naive-icons";

interface PromotionModalProps {
  open: boolean;
  onClose: () => void;
}

export function PromotionModal({ open, onClose }: PromotionModalProps) {
  return (
    <Modal
      open={open}
      variant="game"
      title="TideMail & Nbility 联动福利"
      width={620}
      typewriter={false}
      onClose={onClose}
    >
      <div className="promo-content">
        <p className="promo-content__lead">
          注册即送 Claude Code、Codex 免费额度
        </p>
        <p>一站式 AI 编程助手中转平台</p>
        <Card color="app-yellow">
          <h3>
            <GiftIcon size={20} aria-hidden="true" /> 核心优势
          </h3>
          <ul>
            <li>注册即用，快速接入 AI Coding 工作流</li>
            <li>按次、按量计费，可灵活选择</li>
            <li>支持 Claude、Codex 等多模型</li>
            <li>兼容 Claude Code、Cursor、RooCode 等工具</li>
          </ul>
        </Card>
        <a
          className="promo-content__link"
          href="https://nbility.ai/auth/register?aff=Dptp"
          target="_blank"
          rel="noopener noreferrer"
        >
          立即注册领取免费额度
          <ExternalLinkIcon size={18} aria-hidden="true" />
        </a>
        <p className="form-note">
          通过 TideMail 专属邀请链接注册，享受额外优惠
        </p>
      </div>
    </Modal>
  );
}
