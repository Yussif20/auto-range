import { ArrowLeft, BadgeCheck, CalendarCheck, ClipboardCheck, FileSearch, Gauge, KeyRound, Star, Timer, Wrench } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { PartCard } from "@/components/parts/part-card";
import { ServiceCard } from "@/components/services/service-card";
import { buttonClass } from "@/components/ui/button";
import { CountUp } from "@/components/ui/count-up";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Link } from "@/i18n/navigation";
import { getFaqs, getFeaturedParts, getModels, getReviews, getServices } from "@/lib/data/catalog";
import type { SiteSettings } from "@/lib/data/settings";
import { localized } from "@/lib/i18n-field";
import { whatsappLink } from "@/lib/whatsapp";

export async function StatsBand({ settings }: { settings: SiteSettings }) {
  const [t, locale] = await Promise.all([getTranslations("home.stats"), getLocale()]);
  const stats = [
    { value: settings.statCustomers, suffix: "+", label: t("customers") },
    { value: settings.statYears, suffix: "", label: t("years") },
    { value: settings.statParts, suffix: "+", label: t("parts") },
    { value: settings.statRating, suffix: "/5", label: t("rating"), decimals: 1 },
  ];

  return (
    <section aria-label={t("label")} className="border-b border-line bg-surface">
      <dl className="container-x grid grid-cols-2 divide-line lg:grid-cols-4 lg:divide-x rtl:lg:divide-x-reverse">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse px-4 py-8 text-center">
            <dt className="mt-1 text-sm text-muted">{s.label}</dt>
            <dd className="font-display text-3xl font-bold text-ink sm:text-4xl">
              <CountUp value={s.value} locale={locale} suffix={s.suffix} decimals={s.decimals} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export async function ServicesSection() {
  const [t, services] = await Promise.all([getTranslations("home.services"), getServices()]);
  return (
    <section className="container-x py-20 sm:py-28">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
        <Link href="/services" className={buttonClass("outline")}>
          {t("all")}
        </Link>
      </div>
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service, i) => (
          <li key={service.id}>
            <Reveal delay={(i % 4) * 80} className="h-full">
              <ServiceCard service={service} index={i} />
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

export async function WhyUs() {
  const t = await getTranslations("home.why");
  const points = [
    { icon: BadgeCheck, key: "specialist" },
    { icon: Gauge, key: "tools" },
    { icon: KeyRound, key: "transparent" },
    { icon: Timer, key: "onTime" },
  ] as const;
  const process = [
    { icon: CalendarCheck, key: "book" },
    { icon: FileSearch, key: "diagnose" },
    { icon: ClipboardCheck, key: "approve" },
    { icon: Wrench, key: "track" },
  ] as const;

  return (
    <section className="border-y border-line bg-surface">
      <div className="container-x grid gap-16 py-20 sm:py-28 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {points.map(({ icon: PointIcon, key }) => (
              <li key={key}>
                <PointIcon className="size-6 text-brand" />
                <p className="mt-3 font-semibold">{t(`points.${key}.title`)}</p>
                <p className="mt-1 text-sm leading-7 text-muted">{t(`points.${key}.body`)}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold tracking-[0.2em] text-muted uppercase">{t("processTitle")}</h3>
          <ol className="relative mt-6 space-y-2 before:absolute before:start-6 before:top-6 before:bottom-6 before:w-px before:bg-line">
            {process.map(({ icon: StepIcon, key }, i) => (
              <li key={key}>
                <Reveal delay={i * 100} className="relative flex gap-5 rounded-lg p-3">
                  <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-full border border-line bg-bg text-brand">
                    <StepIcon className="size-5" />
                  </span>
                  <div className="pt-1">
                    <p className="font-semibold">
                      <span className="me-2 text-brand tabular-nums">0{i + 1}</span>
                      {t(`process.${key}.title`)}
                    </p>
                    <p className="mt-1 text-sm leading-7 text-muted">{t(`process.${key}.body`)}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export async function ModelStrip() {
  const [t, locale, models] = await Promise.all([getTranslations("home.models"), getLocale(), getModels()]);
  return (
    <section className="container-x py-20 sm:py-28">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {models.map((m) => (
          <li key={m.id}>
            <Link
              href={{ pathname: "/parts", query: { model: m.slug } }}
              className="group flex h-full flex-col justify-between gap-6 rounded-lg border border-line bg-surface p-4 transition-colors hover:border-brand/60"
            >
              <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-brand uppercase">
                {t(`lines.${m.line}`)}
              </span>
              <span>
                <span className="block font-semibold leading-snug">{localized(m, "name", locale)}</span>
                <span className="mt-1 block text-xs text-muted tabular-nums" dir="ltr">
                  {m.yearFrom}–{m.yearTo ?? t("present")}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export async function FeaturedParts() {
  const [t, parts] = await Promise.all([getTranslations("home.parts"), getFeaturedParts(8)]);
  if (parts.length === 0) return null;
  return (
    <section className="container-x pb-20 sm:pb-28">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
        <Link href="/parts" className={buttonClass("outline")}>
          {t("all")}
        </Link>
      </div>
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {parts.map((part) => (
          <li key={part.id} className="flex">
            <PartCard part={part} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export async function Reviews() {
  const [t, locale, reviews] = await Promise.all([getTranslations("home.reviews"), getLocale(), getReviews()]);
  if (reviews.length === 0) return null;
  return (
    <section className="border-y border-line bg-surface">
      <div className="container-x py-20 sm:py-28">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} align="center" />
        <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <li key={r.id}>
              <Reveal delay={(i % 3) * 80} className="h-full">
                <figure className="flex h-full flex-col rounded-lg border border-line bg-bg p-6">
                  <div className="flex gap-0.5" role="img" aria-label={t("stars", { rating: r.rating })}>
                    {Array.from({ length: 5 }, (_, s) => (
                      <Star
                        key={s}
                        className={`size-4 ${s < r.rating ? "fill-brand text-brand" : "text-line"}`}
                        aria-hidden
                      />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 leading-8 text-ink/90">
                    “{localized(r, "body", locale)}”
                  </blockquote>
                  <figcaption className="mt-6 border-t border-line pt-4 text-sm">
                    <span className="font-semibold">{r.author}</span>
                    <span className="block text-muted">{localized(r, "car", locale)}</span>
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export async function Faq() {
  const [t, locale, faqs] = await Promise.all([getTranslations("home.faq"), getLocale(), getFaqs()]);
  if (faqs.length === 0) return null;
  return (
    <section className="container-x grid gap-12 py-20 sm:py-28 lg:grid-cols-[2fr_3fr]">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      <div className="divide-y divide-line border-y border-line">
        {faqs.map((f) => (
          <details key={f.id} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
              {localized(f, "question", locale)}
              <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line text-brand transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 leading-8 text-muted">{localized(f, "answer", locale)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export async function CtaBand({ settings }: { settings: SiteSettings }) {
  const [t, tActions] = await Promise.all([getTranslations("home.cta"), getTranslations("actions")]);
  return (
    <section className="container-x">
      <div className="relative overflow-hidden rounded-2xl border border-brand/30 bg-[linear-gradient(120deg,var(--red-800),var(--bg)_70%)] rtl:bg-[linear-gradient(240deg,var(--red-800),var(--bg)_70%)] px-6 py-14 sm:px-12">
        <div className="relative max-w-xl">
          <h2 className="text-3xl font-bold sm:text-4xl">{t("title")}</h2>
          <p className="mt-4 leading-8 text-ink/80">{t("body")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/book" className={buttonClass("primary", "lg", "group")}>
              {tActions("bookNow")}
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1 ltr:rotate-180 ltr:group-hover:translate-x-1" />
            </Link>
            <a
              href={whatsappLink(settings.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass("outline", "lg", "border-ink/25")}
            >
              {tActions("chatWhatsapp")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export async function VisitUs({ settings }: { settings: SiteSettings }) {
  const [t, locale] = await Promise.all([getTranslations("home.visit"), getLocale()]);
  return (
    <section className="container-x grid gap-8 py-20 sm:py-28 lg:grid-cols-[2fr_3fr] lg:items-center">
      <div>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
        <dl className="mt-8 space-y-5 text-sm">
          <div>
            <dt className="text-muted">{t("address")}</dt>
            <dd className="mt-1 text-base font-semibold">{localized(settings, "address", locale)}</dd>
          </div>
          <div>
            <dt className="text-muted">{t("hours")}</dt>
            <dd className="mt-1 text-base font-semibold">{localized(settings, "hours", locale)}</dd>
          </div>
          <div>
            <dt className="text-muted">{t("phone")}</dt>
            <dd className="mt-1 text-base font-semibold">
              <a href={`tel:${settings.phone}`} dir="ltr" className="hover:text-brand-hover">
                {settings.phone}
              </a>
            </dd>
          </div>
        </dl>
      </div>
      <iframe
        title={t("mapTitle")}
        src={settings.mapUrl}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="aspect-[16/10] w-full rounded-xl border border-line grayscale-[0.6] invert-[0.92] hue-rotate-180"
      />
    </section>
  );
}
