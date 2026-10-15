import { Check, Clock, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { ServiceCard } from "@/components/services/service-card";
import { buttonClass } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Link } from "@/i18n/navigation";
import { getService, getServices } from "@/lib/data/catalog";
import { formatPrice } from "@/lib/format";
import { localized } from "@/lib/i18n-field";
import { localeAlternates } from "@/lib/seo";
import { breadcrumbSchema, serviceSchema } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/json-ld";

type Props = PageProps<"/[locale]/services/[slug]">;

export async function generateStaticParams() {
  return (await getServices()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [service, locale] = await Promise.all([getService(slug), getLocale()]);
  if (!service) return {};
  return {
    title: localized(service, "title", locale),
    description: localized(service, "summary", locale),
    alternates: localeAlternates(`/services/${slug}`, locale),
  };
}

export default function ServicePage({ params }: Props) {
  return (
    <Suspense fallback={<div className="container-x h-[70vh]" />}>
      <ServiceDetail params={params} />
    </Suspense>
  );
}

const steps = ["inspect", "quote", "repair", "handover"] as const;

async function ServiceDetail({ params }: { params: Props["params"] }) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  const [locale, t, tNav, all] = await Promise.all([
    getLocale(),
    getTranslations("services"),
    getTranslations("nav"),
    getServices(),
  ]);
  const others = all.filter((s) => s.id !== service.id).slice(0, 4);

  return (
    <>
      <JsonLd
        data={[
          serviceSchema(service, locale),
          breadcrumbSchema([
            { name: tNav("home"), path: `/${locale}` },
            { name: tNav("services"), path: `/${locale}/services` },
            { name: localized(service, "title", locale), path: `/${locale}/services/${service.slug}` },
          ]),
        ]}
      />
      <section className="hero-glow relative overflow-hidden border-b border-line">
        {service.image && (
          <>
            <Image
              src={service.image}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-60 max-sm:opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-bg via-bg/80 to-bg/30 ltr:bg-gradient-to-r" />
          </>
        )}
        <div className="container-x relative py-14 sm:py-20">
          <nav aria-label={t("breadcrumb")} className="mb-8 text-sm text-muted">
            <Link href="/services" className="hover:text-ink">
              {tNav("services")}
            </Link>
          </nav>
          <span className="grid size-14 place-items-center rounded-md border border-line bg-surface text-brand">
            <Icon name={service.icon} className="size-6" />
          </span>
          <h1 className="mt-6 max-w-3xl text-3xl font-bold sm:text-5xl">
            {localized(service, "title", locale)}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
            {localized(service, "summary", locale)}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm">
            {service.priceFrom != null && (
              <span className="flex items-center gap-2">
                <Wallet className="size-4 text-brand" />
                {t("from")} <strong>{formatPrice(service.priceFrom, locale)}</strong>
              </span>
            )}
            {service.durationHr != null && (
              <span className="flex items-center gap-2">
                <Clock className="size-4 text-brand" />
                {t("duration", { hours: service.durationHr })}
              </span>
            )}
          </div>
          <Link
            href={{ pathname: "/book", query: { service: service.slug } }}
            className={buttonClass("primary", "lg", "mt-10")}
          >
            {t("bookThis")}
          </Link>
        </div>
      </section>

      <div className="container-x grid gap-12 py-16 lg:grid-cols-[3fr_2fr]">
        <div>
          <h2 className="text-2xl font-bold">{t("whatWeDo")}</h2>
          <p className="mt-4 leading-8 text-muted">{localized(service, "body", locale)}</p>
          <ul className="mt-8 space-y-3">
            {(["genuine", "report", "warranty"] as const).map((k) => (
              <li key={k} className="flex gap-3">
                <Check className="mt-1 size-4 shrink-0 text-brand" />
                <span>{t(`promises.${k}`)}</span>
              </li>
            ))}
          </ul>
        </div>
        <ol className="space-y-4">
          {steps.map((step, i) => (
            <li key={step} className="flex gap-4 rounded-lg border border-line bg-surface p-5">
              <span className="font-display text-2xl font-bold text-brand tabular-nums">{i + 1}</span>
              <div>
                <p className="font-semibold">{t(`steps.${step}.title`)}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{t(`steps.${step}.body`)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <section className="container-x">
        <h2 className="text-2xl font-bold">{t("other")}</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {others.map((s) => (
            <li key={s.id}>
              <ServiceCard service={s} index={all.indexOf(s)} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
