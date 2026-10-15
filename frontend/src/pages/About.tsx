import { useTranslation } from "react-i18next";

export function About() {
  const { t } = useTranslation();

  return (
    <p>{t("About summary")}</p>
  );
}
