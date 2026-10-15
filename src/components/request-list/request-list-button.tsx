"use client";

import { ClipboardList } from "lucide-react";
import { useTranslations } from "next-intl";
import { requestList, useRequestList } from "./store";

export function RequestListButton() {
  const t = useTranslations("requestList");
  const { items } = useRequestList();
  const count = items.reduce((n, i) => n + i.qty, 0);

  return (
    <button
      type="button"
      onClick={() => requestList.setOpen(true)}
      aria-label={t("open", { count })}
      className="relative grid size-10 place-items-center rounded-md border border-line text-ink transition-colors hover:border-ink/40"
    >
      <ClipboardList className="size-5" />
      {count > 0 && (
        <span className="absolute -end-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-brand px-1 text-[0.65rem] font-bold text-white tabular-nums">
          {count}
        </span>
      )}
    </button>
  );
}
