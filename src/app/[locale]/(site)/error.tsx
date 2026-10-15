"use client";

import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("errorPages.server");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="text-2xl font-bold sm:text-3xl">{t("title")}</h1>
      <p className="mt-3 max-w-md leading-8 text-muted">{t("body")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className={buttonClass("primary", "lg")}>
          <RotateCcw className="size-4" />
          {t("retry")}
        </button>
        <Link href="/" className={buttonClass("outline", "lg")}>
          {t("home")}
        </Link>
      </div>
      {error.digest && <p className="mt-6 font-mono text-xs text-muted">{error.digest}</p>}
    </section>
  );
}
