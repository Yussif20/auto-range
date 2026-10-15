import type { Service } from "@prisma/client";
import { ArrowLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Icon } from "@/components/ui/icon";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { localized } from "@/lib/i18n-field";

export function ServiceCard({ service, index }: { service: Service; index: number }) {
  const locale = useLocale();
  const t = useTranslations("services");

  return (
    <Link
      href={`/services/${service.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface p-6 transition-colors hover:border-brand/60"
    >
      <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-brand transition-transform duration-500 group-hover:scale-x-100 rtl:origin-right" />
      <div className="flex items-start justify-between">
        <span className="grid size-12 place-items-center rounded-md border border-line bg-bg text-brand">
          <Icon name={service.icon} className="size-5" />
        </span>
        <span className="font-display text-sm text-muted/60 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h3 className="mt-6 text-lg font-bold">{localized(service, "title", locale)}</h3>
      <p className="mt-2 flex-1 text-sm leading-7 text-muted">{localized(service, "summary", locale)}</p>
      <div className="mt-6 flex items-center justify-between text-sm">
        {service.priceFrom != null ? (
          <span className="text-muted">
            {t("from")} <span className="font-semibold text-ink">{formatPrice(service.priceFrom, locale)}</span>
          </span>
        ) : (
          <span />
        )}
        <ArrowLeft className="size-4 text-brand transition-transform group-hover:-translate-x-1 ltr:rotate-180 ltr:group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
