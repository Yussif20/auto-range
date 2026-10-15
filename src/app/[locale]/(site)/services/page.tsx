import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ServiceCard } from "@/components/services/service-card";
import { buttonClass } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Link } from "@/i18n/navigation";
import { getServices } from "@/lib/data/catalog";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("services");
  return { title: t("metaTitle"), description: t("lead"), alternates: localeAlternates("/services", await getLocale()) };
}

export default async function ServicesPage() {
  const [t, services] = await Promise.all([getTranslations("services"), getServices()]);

  return (
    <div className="container-x py-12 sm:py-16">
      <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service, i) => (
          <li key={service.id}>
            <Reveal delay={(i % 4) * 80} className="h-full">
              <ServiceCard service={service} index={i} />
            </Reveal>
          </li>
        ))}
      </ul>
      <div className="mt-16 flex flex-col items-start justify-between gap-6 rounded-xl border border-line bg-surface p-8 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold">{t("notListedTitle")}</h2>
          <p className="mt-2 text-sm text-muted">{t("notListedBody")}</p>
        </div>
        <Link href="/book" className={buttonClass("primary", "lg")}>
          {t("bookCta")}
        </Link>
      </div>
    </div>
  );
}
