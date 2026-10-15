import { ArrowLeft, Cpu, Search, ShieldCheck, Timer } from "lucide-react";
import Form from "next/form";
import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export async function Hero() {
  const [t, tActions, locale] = await Promise.all([
    getTranslations("home"),
    getTranslations("actions"),
    getLocale(),
  ]);

  const highlights = [
    { icon: ShieldCheck, label: t("highlights.genuine") },
    { icon: Cpu, label: t("highlights.diagnostics") },
    { icon: Timer, label: t("highlights.tracking") },
  ];

  return (
    <section className="relative -mt-[4.5rem] overflow-hidden bg-bg pt-[4.5rem]">
      {/* The car sits right in the photo: mirrored in RTL so it's always opposite the headline. */}
      <Image
        src="/images/hero.webp"
        alt=""
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="object-cover object-[75%_center] opacity-90 max-sm:opacity-40 rtl:-scale-x-100"
      />
      <div className="absolute inset-0 bg-gradient-to-l from-bg via-bg/60 to-transparent ltr:bg-gradient-to-r" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />
      <div className="container-x relative py-16 sm:py-24 lg:py-28">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3.5 py-1.5 text-xs text-muted">
          <span className="size-1.5 animate-pulse rounded-full bg-brand" />
          {t("eyebrow")}
        </p>
        <h1 className="max-w-3xl text-4xl leading-[1.15] font-bold sm:text-6xl">
          {t("titleLine1")}
          <span className="block text-brand">{t("titleLine2")}</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-8 text-muted sm:text-lg">{t("lead")}</p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/book" className={buttonClass("primary", "lg", "group")}>
            {tActions("bookNow")}
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1 ltr:rotate-180 ltr:group-hover:translate-x-1" />
          </Link>
          <Link href="/parts" className={buttonClass("outline", "lg")}>
            {tActions("browseParts")}
          </Link>
        </div>

        <Form
          action={`/${locale}/parts`}
          role="search"
          className="mt-12 flex max-w-2xl items-center gap-2 rounded-lg border border-line bg-surface/80 p-2 backdrop-blur"
        >
          <label className="relative flex-1">
            <span className="sr-only">{t("searchLabel")}</span>
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              name="q"
              placeholder={t("searchPlaceholder")}
              className="h-11 w-full rounded-md bg-transparent ps-9 pe-3 text-sm text-ink placeholder:text-muted focus:outline-none"
            />
          </label>
          <button type="submit" className={buttonClass("primary", "md", "h-11")}>
            {t("searchButton")}
          </button>
        </Form>

        <ul className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
          {highlights.map(({ icon: HighlightIcon, label }) => (
            <li key={label} className="flex items-center gap-3 text-sm text-ink">
              <span className="grid size-9 place-items-center rounded-md border border-line bg-surface text-brand">
                <HighlightIcon className="size-4" />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>
      <div className="horizon" />
    </section>
  );
}
