import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/section-heading";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("privacy");
  return { title: t("title"), alternates: localeAlternates("/privacy", await getLocale()) };
}

const sections = ["collect", "use", "share", "keep", "rights"] as const;

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");
  return (
    <div className="container-x max-w-3xl py-12 sm:py-16">
      <SectionHeading as="h1" title={t("title")} lead={t("lead")} />
      <div className="mt-10 space-y-8">
        {sections.map((key) => (
          <section key={key}>
            <h2 className="text-lg font-bold">{t(`${key}.title`)}</h2>
            <p className="mt-2 leading-8 text-muted">{t(`${key}.body`)}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
