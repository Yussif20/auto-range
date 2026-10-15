import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { FilterBar } from "@/components/parts/filter-bar";
import { PartCard } from "@/components/parts/part-card";
import { buttonClass } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Link } from "@/i18n/navigation";
import { getCategories, getModels, type PartFilters, searchParts } from "@/lib/data/catalog";
import { localized } from "@/lib/i18n-field";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("parts");
  return { title: t("metaTitle"), description: t("lead") };
}

export default async function PartsPage({ searchParams }: PageProps<"/[locale]/parts">) {
  const t = await getTranslations("parts");
  return (
    <div className="container-x py-12 sm:py-16">
      <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      <div className="mt-10">
        <Suspense fallback={<ResultsSkeleton />}>
          <PartsResults searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

async function PartsResults({ searchParams }: { searchParams: PageProps<"/[locale]/parts">["searchParams"] }) {
  const sp = await searchParams;
  const filters: PartFilters = {
    q: one(sp.q).slice(0, 80),
    model: one(sp.model),
    category: one(sp.category),
    inStock: one(sp.inStock) === "1",
    page: Number.parseInt(one(sp.page), 10) || 1,
  };

  const [locale, t, models, categories, result] = await Promise.all([
    getLocale(),
    getTranslations("parts"),
    getModels(),
    getCategories(),
    searchParts(filters),
  ]);

  const pageHref = (page: number) => ({
    pathname: "/parts" as const,
    query: Object.fromEntries(
      Object.entries({ ...sp, page: page > 1 ? String(page) : undefined }).filter(([, v]) => v),
    ) as Record<string, string>,
  });

  return (
    <>
      <FilterBar
        models={models.map((m) => ({ slug: m.slug, label: localized(m, "name", locale) }))}
        categories={categories.map((c) => ({ slug: c.slug, label: localized(c, "name", locale) }))}
        values={{ q: filters.q!, model: filters.model!, category: filters.category!, inStock: !!filters.inStock }}
      />

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {t("count", { count: result.total })}
      </p>

      {result.items.length > 0 ? (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {result.items.map((part) => (
            <li key={part.id} className="flex">
              <PartCard part={part} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-lg border border-dashed border-line p-10 text-center">
          <p className="font-semibold">{t("noResults")}</p>
          <p className="mt-2 text-sm text-muted">{t("noResultsHint")}</p>
          <Link href="/parts" className={buttonClass("outline", "md", "mt-5")}>
            {t("clearFilters")}
          </Link>
        </div>
      )}

      {result.pages > 1 && (
        <nav aria-label={t("pagination")} className="mt-10 flex items-center justify-center gap-2">
          {result.page > 1 && (
            <Link href={pageHref(result.page - 1)} aria-label={t("prev")} className={buttonClass("outline")}>
              <ChevronRight className="size-4 ltr:rotate-180" />
            </Link>
          )}
          {Array.from({ length: result.pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              aria-current={p === result.page ? "page" : undefined}
              className={buttonClass(p === result.page ? "primary" : "outline", "md", "min-w-11 tabular-nums")}
            >
              {p}
            </Link>
          ))}
          {result.page < result.pages && (
            <Link href={pageHref(result.page + 1)} aria-label={t("next")} className={buttonClass("outline")}>
              <ChevronLeft className="size-4 ltr:rotate-180" />
            </Link>
          )}
        </nav>
      )}
    </>
  );
}

function ResultsSkeleton() {
  return (
    <div aria-hidden>
      <div className="h-[4.25rem] rounded-lg border border-line bg-surface/60" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-80 animate-pulse rounded-lg border border-line bg-surface" />
        ))}
      </div>
    </div>
  );
}
