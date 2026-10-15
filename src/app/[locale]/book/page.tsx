import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { connection } from "next/server";
import { Suspense } from "react";
import { BookingForm } from "@/components/booking/booking-form";
import { SectionHeading } from "@/components/ui/section-heading";
import { bookableDates } from "@/lib/booking";
import { getModels, getServices } from "@/lib/data/catalog";
import { getSettings } from "@/lib/data/settings";
import { localized } from "@/lib/i18n-field";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("book");
  return { title: t("metaTitle"), description: t("lead") };
}

export default async function BookPage({ searchParams }: PageProps<"/[locale]/book">) {
  const t = await getTranslations("book");
  return (
    <div className="container-x py-12 sm:py-16">
      <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      <div className="mt-10">
        <Suspense fallback={<div className="h-[32rem] animate-pulse rounded-xl border border-line bg-surface" />}>
          <BookingLoader searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function BookingLoader({ searchParams }: { searchParams: PageProps<"/[locale]/book">["searchParams"] }) {
  const sp = await searchParams;
  // Available dates depend on today's date, so this always renders per request.
  await connection();
  const [locale, models, services, settings] = await Promise.all([
    getLocale(),
    getModels(),
    getServices(),
    getSettings(),
  ]);
  const maxYear = new Date().getUTCFullYear() + 1;
  const preselected = services.find((s) => s.slug === sp.service);

  return (
    <BookingForm
      models={models.map((m) => ({
        id: m.id,
        name: localized(m, "name", locale),
        yearFrom: m.yearFrom,
        yearTo: Math.min(m.yearTo ?? maxYear, maxYear),
      }))}
      services={services.map((s) => ({
        id: s.id,
        icon: s.icon,
        title: localized(s, "title", locale),
        priceFrom: s.priceFrom,
      }))}
      dates={bookableDates(settings)}
      initialServiceIds={preselected ? [preselected.id] : []}
    />
  );
}
