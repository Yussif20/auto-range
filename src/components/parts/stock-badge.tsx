import type { StockStatus } from "@prisma/client";
import clsx from "clsx";
import { useTranslations } from "next-intl";

const tone: Record<StockStatus, string> = {
  IN_STOCK: "bg-success/10 text-success",
  LOW_STOCK: "bg-warning/10 text-warning",
  ON_ORDER: "bg-surface-2 text-muted",
  OUT_OF_STOCK: "bg-brand/10 text-brand-hover",
};

export function StockBadge({ stock }: { stock: StockStatus }) {
  const t = useTranslations("parts.stock");
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", tone[stock])}>
      <span className="size-1.5 rounded-full bg-current" />
      {t(stock)}
    </span>
  );
}
