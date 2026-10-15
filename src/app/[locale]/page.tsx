import { ArrowLeft, Cpu, ShieldCheck, Timer } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// Phase 1 hero only; the full home page lands with the data layer.
export default function HomePage() {
  const t = useTranslations("home");
  const tActions = useTranslations("actions");

  const highlights = [
    { icon: ShieldCheck, label: t("highlights.genuine") },
    { icon: Cpu, label: t("highlights.diagnostics") },
    { icon: Timer, label: t("highlights.tracking") },
  ];

  return (
    <section className="hero-glow relative -mt-[4.5rem] overflow-hidden pt-[4.5rem]">
      <div className="container-x py-20 sm:py-28 lg:py-36">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3.5 py-1.5 text-xs text-muted">
          <span className="size-1.5 rounded-full bg-brand" />
          {t("eyebrow")}
        </p>
        <h1 className="max-w-3xl text-4xl leading-[1.15] font-bold sm:text-6xl">
          {t("titleLine1")}
          <span className="block text-brand">{t("titleLine2")}</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-8 text-muted sm:text-lg">
          {t("lead")}
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/book"
            className="group inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3.5 font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            {tActions("bookNow")}
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1 ltr:rotate-180 ltr:group-hover:translate-x-1" />
          </Link>
          <Link
            href="/parts"
            className="inline-flex items-center rounded-md border border-line px-6 py-3.5 font-semibold text-ink transition-colors hover:border-ink/40"
          >
            {tActions("browseParts")}
          </Link>
        </div>
        <ul className="mt-14 grid max-w-2xl gap-4 sm:grid-cols-3">
          {highlights.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-sm text-ink">
              <span className="grid size-9 place-items-center rounded-md border border-line bg-surface text-brand">
                <Icon className="size-4" />
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
