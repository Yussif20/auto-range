"use client";

import { Check, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { buttonClass } from "@/components/ui/button";
import { type RequestItem, requestList, useRequestList } from "./store";

export function AddToRequest({
  part,
  size = "md",
  className,
}: {
  part: Omit<RequestItem, "qty">;
  size?: "md" | "lg";
  className?: string;
}) {
  const t = useTranslations("requestList");
  const { items } = useRequestList();
  const inList = items.some((i) => i.id === part.id);

  return (
    <button
      type="button"
      onClick={() => requestList.add(part)}
      className={buttonClass(inList ? "outline" : "primary", size, className)}
    >
      {inList ? <Check className="size-4" /> : <Plus className="size-4" />}
      {inList ? t("added") : t("add")}
    </button>
  );
}
