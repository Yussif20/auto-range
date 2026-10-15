import { Award, Eye, Handshake, Leaf } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LogoMark } from "@/components/brand/logo-mark";
import { CtaBand, ModelStrip, StatsBand } from "@/components/home/sections";
import { SectionHeading } from "@/components/ui/section-heading";
import { getSettings } from "@/lib/data/settings";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return { title: t("metaTitle"), description: t("lead") };
}

const values = [
  { icon: Award, key: "craft" },
  { icon: Eye, key: "honesty" },
  { icon: Handshake, key: "respect" },
  { icon: Leaf, key: "longevity" },
] as const;

export default async function AboutPage() {
  const [t, settings] = await Promise.all([getTranslations("about"), getSettings()]);

  return (
    <>
      <section className="hero-glow relative overflow-hidden border-b border-line">
        <LogoMark mono className="pointer-events-none absolute -end-16 -top-10 hidden size-96 text-ink/[0.035] md:block" />
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

      <div className="border-t border-line">
        <ModelStrip />
      </div>
      <CtaBand settings={settings} />
    </>
  );
}
