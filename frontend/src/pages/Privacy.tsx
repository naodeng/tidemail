import { useTranslation } from "react-i18next";

const privacySections = [
  ["privacyPolicy.dataTitle", "privacyPolicy.dataBody"],
  ["privacyPolicy.useTitle", "privacyPolicy.useBody"],
  ["privacyPolicy.mailboxPrivacyTitle", "privacyPolicy.mailboxPrivacyBody"],
  ["privacyPolicy.retentionTitle", "privacyPolicy.retentionBody"],
  ["privacyPolicy.browserStorageTitle", "privacyPolicy.browserStorageBody"],
  ["privacyPolicy.providersTitle", "privacyPolicy.providersBody"],
  ["privacyPolicy.securityTitle", "privacyPolicy.securityBody"],
  ["privacyPolicy.transfersTitle", "privacyPolicy.transfersBody"],
  ["privacyPolicy.rightsTitle", "privacyPolicy.rightsBody"],
  ["privacyPolicy.childrenTitle", "privacyPolicy.childrenBody"],
  ["privacyPolicy.changesTitle", "privacyPolicy.changesBody"],
  ["privacyPolicy.contactTitle", "privacyPolicy.contactBody"],
] as const;

export function Privacy() {
  const { t } = useTranslation();

  return (
    <article className="legal-document">
      <p className="legal-document__intro">{t("privacyPolicy.intro")}</p>
      {privacySections.map(([title, body]) => (
        <section className="legal-document__section" key={title}>
          <h2 className="mt-8 text-2xl font-bold">{t(title)}</h2>
          <p className="mt-4">{t(body)}</p>
        </section>
      ))}
      <p className="legal-document__last-updated">
        {t("Last updated")}: 2026-10-16
      </p>
    </article>
  );
}
