import { useTranslation } from "react-i18next";

const termsSections: Array<{
  title: string;
  paragraphs: string[];
  list?: string[];
}> = [
  {
    title: "termsOfService.descriptionTitle",
    paragraphs: ["termsOfService.descriptionBody"],
  },
  {
    title: "termsOfService.restrictionsTitle",
    paragraphs: [
      "termsOfService.availabilityBody",
      "termsOfService.copyrightBody",
    ],
  },
  {
    title: "termsOfService.responsibilitiesTitle",
    paragraphs: [
      "termsOfService.registrationBody",
      "termsOfService.mailboxAccessBody",
      "termsOfService.prohibitedActivitiesBody",
    ],
    list: [
      "termsOfService.prohibitedActivityOne",
      "termsOfService.prohibitedActivityTwo",
      "termsOfService.prohibitedActivityThree",
      "termsOfService.prohibitedActivityFour",
    ],
  },
  {
    title: "termsOfService.emailSendingTitle",
    paragraphs: ["termsOfService.emailSendingBody"],
  },
  {
    title: "termsOfService.warrantyTitle",
    paragraphs: ["termsOfService.warrantyBody"],
  },
  {
    title: "termsOfService.liabilityTitle",
    paragraphs: ["termsOfService.liabilityBody"],
  },
  {
    title: "termsOfService.modificationTitle",
    paragraphs: ["termsOfService.modificationBody"],
  },
  {
    title: "termsOfService.governingLawTitle",
    paragraphs: ["termsOfService.governingLawBody"],
  },
];

export function Terms() {
  const { t } = useTranslation();

  return (
    <article className="legal-document">
      <p className="legal-document__intro">{t("termsOfService.intro")}</p>
      {termsSections.map(({ title, paragraphs, list }) => (
        <section className="legal-document__section" key={title}>
          <h2 className="mt-8 text-2xl font-bold">{t(title)}</h2>
          {paragraphs.map((paragraph) => (
            <p className="mt-4" key={paragraph}>
              {t(paragraph)}
            </p>
          ))}
          {list && (
            <ul className="legal-document__list mt-4">
              {list.map((item) => (
                <li key={item}>{t(item)}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
      <p className="mt-4">{t("termsOfService.contactBody")}</p>
      <p className="legal-document__last-updated">
        {t("Last updated")}: 2026-10-16
      </p>
    </article>
  );
}
