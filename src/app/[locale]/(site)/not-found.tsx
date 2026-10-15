import { getTranslations } from "next-intl/server";
import { LogoMark } from "@/components/brand/logo-mark";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("errorPages.notFound");
  return (
    <section className="hero-glow relative overflow-hidden">
      <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <LogoMark mono className="size-20 text-ink/20" />
        <p className="mt-8 font-display text-7xl font-bold text-brand">404</p>
        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">{t("title")}</h1>
        <p className="mt-3 max-w-md leading-8 text-muted">{t("body")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={buttonClass("primary", "lg")}>
            {t("home")}
          </Link>
          <Link href="/parts" className={buttonClass("outline", "lg")}>
            {t("parts")}
          </Link>
        </div>
      </div>
    </section>
  );
}
