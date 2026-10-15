import type { Service } from "@prisma/client";
import clsx from "clsx";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Icon } from "@/components/ui/icon";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { localized } from "@/lib/i18n-field";

export function ServiceCard({ service, index }: { service: Service; index: number }) {
  const locale = useLocale();
  const t = useTranslations("services");
  const title = localized(service, "title", locale);

  return (
    <Link
      href={`/services/${service.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface transition-colors hover:border-brand/60"
    >
      <span className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 bg-brand transition-transform duration-500 group-hover:scale-x-100 rtl:origin-right" />
      {service.image && (
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={service.image}
            alt={title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
        </div>
      )}
      <div className={clsx("relative flex flex-1 flex-col p-6", service.image && "pt-0")}>
        <div className={clsx("flex items-end justify-between", service.image && "-mt-6")}>
          <span className="grid size-12 place-items-center rounded-md border border-line bg-bg text-brand">
            <Icon name={service.icon} className="size-5" />
          </span>
          <span className="font-display text-sm text-muted/60 tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <h3 className="mt-5 text-lg font-bold">{title}</h3>
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
      </div>
    </Link>
  );
}
