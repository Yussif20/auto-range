import clsx from "clsx";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function InboxFilter({
  base,
  statuses,
  current,
}: {
  base: "/admin/requests" | "/admin/messages";
  statuses: string[];
  current?: string;
}) {
  const t = useTranslations("admin.inboxStatus");
  const chip = "rounded-full border px-3 py-1.5 text-xs transition-colors";
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      <Link
        href={base}
        className={clsx(chip, !current ? "border-brand bg-brand text-white" : "border-line text-muted hover:text-ink")}
      >
        {t("open")}
      </Link>
      {statuses.map((s) => (
        <Link
          key={s}
          href={{ pathname: base, query: { status: s } }}
          className={clsx(chip, current === s ? "border-brand bg-brand text-white" : "border-line text-muted hover:text-ink")}
        >
          {t(s)}
        </Link>
      ))}
    </div>
  );
}
