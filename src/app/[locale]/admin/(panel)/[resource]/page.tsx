import clsx from "clsx";
import { CheckCircle2, Plus, Star } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { EmptyState, PageHeader, tableClass, tableWrap, tdClass, thClass } from "@/components/admin/ui";
import { StockBadge } from "@/components/parts/stock-badge";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ADMIN_PAGE_SIZE, type ListRow, listRows } from "@/lib/admin/resource-data";
import { isResource, type ResourceKey } from "@/lib/admin/resources";
import { formatPrice } from "@/lib/format";
import { localized } from "@/lib/i18n-field";
import { adminPage } from "@/lib/auth/session";

// Session-gated: allowed to block on navigation (see the panel layout).
export const instant = false;

type Props = PageProps<"/[locale]/admin/[resource]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { resource } = await params;
  if (!isResource(resource)) return {};
  const t = await getTranslations("admin.nav");
  return { title: t(resource) };
}

export default async function ResourceListPage({ params, searchParams }: Props) {
  await adminPage();
  const [{ resource }, sp] = await Promise.all([params, searchParams]);
  if (!isResource(resource)) notFound();

  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 60) : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const [t, tNav, locale, { total, rows }] = await Promise.all([
    getTranslations("admin.resources"),
    getTranslations("admin.nav"),
    getLocale(),
    listRows(resource, q, page),
  ]);
  const pages = Math.ceil(total / ADMIN_PAGE_SIZE);

  return (
    <>
      <PageHeader
        title={tNav(resource)}
        lead={t("count", { count: total })}
        actions={
          <Link href={`/admin/${resource}/new`} className={buttonClass("primary")}>
            <Plus className="size-4" />
            {t("add")}
          </Link>
        }
      />

      {(sp.saved || sp.deleted) && (
        <p role="status" className="mb-5 flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm">
          <CheckCircle2 className="size-4 text-success" />
          {sp.saved ? t("saved") : t("deleted")}
        </p>
      )}

      {resource === "parts" && (
        <form className="mb-5">
          <input
            name="q"
            defaultValue={q}
            placeholder={t("searchParts")}
            className="w-full rounded-md border border-line bg-bg px-3 py-2 text-sm sm:w-80"
          />
        </form>
      )}

      {rows.length === 0 ? (
        <EmptyState>{t("empty")}</EmptyState>
      ) : (
        <div className={tableWrap}>
          <table className={tableClass}>
            <thead className="border-b border-line">
              <tr>
                {columns[resource].map((key) => (
                  <th key={key} className={thClass}>
                    {t(`cols.${key}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-2/60">
                  <Cells row={row} locale={locale} resource={resource} hidden={t("hidden")} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <nav className="mt-6 flex justify-center gap-2 text-sm">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={{ pathname: `/admin/${resource}`, query: { ...(q && { q }), ...(p > 1 && { page: String(p) }) } }}
              aria-current={p === page ? "page" : undefined}
              className={clsx("min-w-9 rounded-md border px-3 py-1.5 text-center", p === page ? "border-brand bg-brand text-white" : "border-line")}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}

const columns: Record<ResourceKey, string[]> = {
  parts: ["name", "oem", "category", "price", "stock"],
  categories: ["name", "slug", "parts"],
  services: ["name", "price", "order", "visible"],
  models: ["name", "line", "years", "parts"],
  reviews: ["author", "car", "rating", "visible"],
  faqs: ["question", "order", "visible"],
};

function Cells({ row, locale, resource, hidden }: { row: ListRow; locale: string; resource: ResourceKey; hidden: string }) {
  const edit = (label: React.ReactNode) => (
    <Link href={`/admin/${resource}/${row.id}`} className="font-medium hover:text-brand-text">
      {label}
    </Link>
  );
  const visible = (on: boolean) => (on ? "✓" : <span className="text-muted">{hidden}</span>);

  switch (row.kind) {
    case "parts":
      return (
        <>
          <td className={tdClass}>
            {edit(localized(row, "name", locale))}
            {row.featured && <Star className="ms-2 inline size-3.5 fill-brand text-brand" aria-label="featured" />}
            {!row.active && <span className="ms-2 text-xs text-muted">({hidden})</span>}
          </td>
          <td className={`${tdClass} font-mono text-xs`} dir="ltr">{row.oemNumber}</td>
          <td className={tdClass}>{localized(row.category, "name", locale)}</td>
          <td className={`${tdClass} tabular-nums`}>{row.price != null ? formatPrice(row.price, locale) : "—"}</td>
          <td className={tdClass}><StockBadge stock={row.stock} /></td>
        </>
      );
    case "categories":
      return (
        <>
          <td className={tdClass}>{edit(localized(row, "name", locale))}</td>
          <td className={`${tdClass} font-mono text-xs`} dir="ltr">{row.slug}</td>
          <td className={`${tdClass} tabular-nums`}>{row._count.parts}</td>
        </>
      );
    case "services":
      return (
        <>
          <td className={tdClass}>{edit(localized(row, "title", locale))}</td>
          <td className={`${tdClass} tabular-nums`}>{row.priceFrom != null ? formatPrice(row.priceFrom, locale) : "—"}</td>
          <td className={`${tdClass} tabular-nums`}>{row.sortOrder}</td>
          <td className={tdClass}>{visible(row.active)}</td>
        </>
      );
    case "models":
      return (
        <>
          <td className={tdClass}>{edit(localized(row, "name", locale))}</td>
          <td className={tdClass}>{row.line.replace("_", " ")}</td>
          <td className={`${tdClass} tabular-nums`} dir="ltr">{row.yearFrom}–{row.yearTo ?? ""}</td>
          <td className={`${tdClass} tabular-nums`}>{row._count.compatibilities}</td>
        </>
      );
    case "reviews":
      return (
        <>
          <td className={tdClass}>{edit(row.author)}</td>
          <td className={tdClass}>{localized(row, "car", locale)}</td>
          <td className={`${tdClass} tabular-nums`}>{row.rating}/5</td>
          <td className={tdClass}>{visible(row.published)}</td>
        </>
      );
    case "faqs":
      return (
        <>
          <td className={`${tdClass} max-w-md`}>{edit(localized(row, "question", locale))}</td>
          <td className={`${tdClass} tabular-nums`}>{row.sortOrder}</td>
          <td className={tdClass}>{visible(row.published)}</td>
        </>
      );
  }
}
