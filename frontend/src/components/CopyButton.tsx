import { useEffect, useState } from "react";
import { Button } from "animal-island-ui";
import { CheckIcon, CopyIcon } from "naive-icons";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { t } = useTranslation();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success(t("Copied to clipboard"));
    } catch {
      toast.error(t("Copy failed"));
    }
  };

  useEffect(() => {
    if (!isCopied) return;
    const timer = window.setTimeout(() => setIsCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [isCopied]);

  return (
    <Button
      type="text"
      size="small"
      className={className}
      icon={
        isCopied ? (
          <CheckIcon aria-hidden="true" />
        ) : (
          <CopyIcon aria-hidden="true" />
        )
      }
      onClick={handleCopy}
      aria-label={t(isCopied ? "Copied to clipboard" : "Copy to clipboard")}
    />
  );
}
