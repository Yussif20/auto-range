import { useLocale, useTranslations } from "next-intl";
import { AddToRequest } from "@/components/request-list/add-to-request";
import { Link } from "@/i18n/navigation";
import type { PartCard as PartCardData } from "@/lib/data/catalog";
import { formatPrice } from "@/lib/format";
import { localized } from "@/lib/i18n-field";
import { PartVisual } from "./part-visual";
import { StockBadge } from "./stock-badge";

export function PartCard({ part }: { part: PartCardData }) {
  const locale = useLocale();
  const t = useTranslations("parts");
  const name = localized(part, "name", locale);

  return (
    <article className="group flex w-full flex-col overflow-hidden rounded-lg border border-line bg-surface transition-colors hover:border-ink/25">
      <Link href={`/parts/${part.slug}`} className="block" tabIndex={-1} aria-hidden>
        <PartVisual
          image={part.images[0]}
          icon={part.category.icon}
          alt={name}
          className="aspect-[4/3] transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2 text-xs text-muted">
          <span>{localized(part.category, "name", locale)}</span>
          <StockBadge stock={part.stock} />
        </div>
        <h3 className="text-base leading-snug font-semibold">
          <Link href={`/parts/${part.slug}`} className="hover:text-brand-text">
            {name}
          </Link>
        </h3>
        <p className="font-mono text-xs text-muted" dir="ltr">
          {part.oemNumber}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <p className="font-display font-bold text-ink">
            {part.price != null ? formatPrice(part.price, locale) : <span className="text-sm text-muted">{t("askPrice")}</span>}
          </p>
          <AddToRequest
            part={{ id: part.id, slug: part.slug, nameAr: part.nameAr, nameEn: part.nameEn, oemNumber: part.oemNumber }}
          />
        </div>
      </div>
    </article>
  );
}
