import { Award, Eye, Handshake, Leaf } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { CtaBand, ModelStrip, StatsBand } from "@/components/home/sections";
import { SectionHeading } from "@/components/ui/section-heading";
import { getModels } from "@/lib/data/catalog";
import { getSettings } from "@/lib/data/settings";
import { localized } from "@/lib/i18n-field";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return { title: t("metaTitle"), description: t("lead"), alternates: localeAlternates("/about", await getLocale()) };
}

const values = [
  { icon: Award, key: "craft" },
  { icon: Eye, key: "honesty" },
  { icon: Handshake, key: "respect" },
  { icon: Leaf, key: "longevity" },
] as const;

export default async function AboutPage() {
  const [t, settings, locale, models] = await Promise.all([
    getTranslations("about"),
    getSettings(),
    getLocale(),
    getModels(),
  ]);
  // The flagship Range Rover photo already leads the home page.
  const gallery = models.filter((m) => m.image && m.slug !== "range-rover").slice(0, 4);

  return (
    <>
      <section className="hero-glow relative overflow-hidden border-b border-line">
        <Image src="/images/workshop.webp" alt="" fill priority sizes="100vw" className="object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-l from-bg via-bg/80 to-bg/20 ltr:bg-gradient-to-r" />
        <div className="container-x relative py-16 sm:py-24">
          <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
        </div>
      </section>

      <StatsBand settings={settings} />

      <section className="container-x grid gap-12 py-20 sm:py-28 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">{t("story.title")}</h2>
          <div className="mt-6 space-y-5 leading-8 text-muted">
            <p>{t("story.p1")}</p>
            <p>{t("story.p2")}</p>
            <p>{t("story.p3")}</p>
          </div>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {values.map(({ icon: ValueIcon, key }) => (
            <li key={key} className="rounded-lg border border-line bg-surface p-6">
              <ValueIcon className="size-6 text-brand" />
              <p className="mt-4 font-semibold">{t(`values.${key}.title`)}</p>
              <p className="mt-2 text-sm leading-7 text-muted">{t(`values.${key}.body`)}</p>
            </li>
          ))}
        </ul>
      </section>

      {gallery.length > 0 && (
        <section className="border-t border-line bg-surface">
          <div className="container-x py-20 sm:py-28">
            <SectionHeading eyebrow={t("gallery.eyebrow")} title={t("gallery.title")} />
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {gallery.map((m) => (
                <li key={m.id} className="group relative aspect-[16/9] overflow-hidden rounded-xl border border-line">
                  <Image
                    src={m.image!}
                    alt={localized(m, "name", locale)}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg/90 to-transparent p-5 pt-16">
                    <p className="font-semibold">{localized(m, "name", locale)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="border-t border-line">
        <ModelStrip />
      </div>
      <CtaBand settings={settings} />
    </>
  );
}
