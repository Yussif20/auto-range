import { MessageCircle, ShieldCheck, Truck, Wrench } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { PartCard } from "@/components/parts/part-card";
import { PartVisual } from "@/components/parts/part-visual";
import { StockBadge } from "@/components/parts/stock-badge";
import { AddToRequest } from "@/components/request-list/add-to-request";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getPart, getPartSlugs, getRelatedParts } from "@/lib/data/catalog";
import { getSettings } from "@/lib/data/settings";
import { formatPrice } from "@/lib/format";
import { localized } from "@/lib/i18n-field";
import { localeAlternates } from "@/lib/seo";
import { breadcrumbSchema, productSchema } from "@/lib/structured-data";
import { whatsappLink } from "@/lib/whatsapp";
import { JsonLd } from "@/components/seo/json-ld";

type Props = PageProps<"/[locale]/parts/[slug]">;

export async function generateStaticParams() {
  return (await getPartSlugs()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [part, locale] = await Promise.all([getPart(slug), getLocale()]);
  if (!part) return {};
  return {
    title: `${localized(part, "name", locale)} (${part.oemNumber})`,
    description: localized(part, "desc", locale),
    alternates: localeAlternates(`/parts/${slug}`, locale),
  };
}

export default function PartPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="container-x h-[70vh]" />}>
      <PartDetail params={params} />
    </Suspense>
  );
}

async function PartDetail({ params }: { params: Props["params"] }) {
  const { slug } = await params;
  const part = await getPart(slug);
  if (!part) notFound();

  const [locale, t, tNav, settings, related] = await Promise.all([
    getLocale(),
    getTranslations("parts"),
    getTranslations("nav"),
    getSettings(),
    getRelatedParts(part.categoryId, part.id),
  ]);
  const name = localized(part, "name", locale);
  const askText = t("askWhatsapp", { name, oem: part.oemNumber });

  return (
    <div className="container-x py-10 sm:py-14">
      <JsonLd
        data={[
          productSchema(part, locale),
          breadcrumbSchema([
            { name: tNav("home"), path: `/${locale}` },
            { name: tNav("parts"), path: `/${locale}/parts` },
            { name, path: `/${locale}/parts/${part.slug}` },
          ]),
        ]}
      />
      <nav aria-label={t("breadcrumb")} className="mb-8 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-ink">
              {tNav("home")}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/parts" className="hover:text-ink">
              {tNav("parts")}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href={{ pathname: "/parts", query: { category: part.category.slug } }} className="hover:text-ink">
              {localized(part.category, "name", locale)}
            </Link>
          </li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <PartVisual
          image={part.images[0]}
          icon={part.category.icon}
          alt={name}
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="aspect-square rounded-xl border border-line"
        />

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <StockBadge stock={part.stock} />
            <span className="text-xs text-muted">{part.brand}</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{name}</h1>
          <p className="mt-3 text-sm text-muted">
            {t("oem")}:{" "}
            <span className="font-mono text-ink" dir="ltr">
              {part.oemNumber}
            </span>
          </p>
          <p className="mt-6 font-display text-3xl font-bold">
            {part.price != null ? formatPrice(part.price, locale) : <span className="text-xl text-muted">{t("askPrice")}</span>}
          </p>
          <p className="mt-6 leading-8 text-muted">{localized(part, "desc", locale)}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <AddToRequest
              size="lg"
              part={{ id: part.id, slug: part.slug, nameAr: part.nameAr, nameEn: part.nameEn, oemNumber: part.oemNumber }}
            />
            <a
              href={whatsappLink(settings.whatsapp, askText)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass("outline", "lg")}
            >
              <MessageCircle className="size-4 text-[#25D366]" />
              {t("askButton")}
            </a>
          </div>

          <ul className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
            {[
              { icon: ShieldCheck, label: t("perks.genuine") },
              { icon: Wrench, label: t("perks.fitting") },
              { icon: Truck, label: t("perks.sourcing") },
            ].map(({ icon: PerkIcon, label }) => (
              <li key={label} className="flex items-center gap-2.5 rounded-md border border-line bg-surface px-3 py-2.5">
                <PerkIcon className="size-4 shrink-0 text-brand" />
                {label}
              </li>
            ))}
          </ul>

          <h2 className="mt-10 text-lg font-bold">{t("fits")}</h2>
          <div className="mt-3 overflow-hidden rounded-lg border border-line">
            <table className="w-full text-sm">
              <thead className="bg-surface text-muted">
                <tr>
                  <th scope="col" className="px-4 py-2.5 text-start font-medium">
                    {t("model")}
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-start font-medium">
                    {t("years")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {part.compatibilities.map(({ model, yearFrom, yearTo }) => (
                  <tr key={model.id}>
                    <td className="px-4 py-2.5">
                      <Link href={{ pathname: "/parts", query: { model: model.slug } }} className="hover:text-brand-text">
                        {localized(model, "name", locale)}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-muted tabular-nums" dir="ltr">
                      {yearFrom ?? model.yearFrom}–{yearTo ?? model.yearTo ?? t("present")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-6 text-muted">{t("vinHint")}</p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-bold">{t("related")}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <li key={p.id} className="flex">
                <PartCard part={p} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
