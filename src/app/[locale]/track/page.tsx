import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { TrackForm } from "@/components/booking/track-form";
import { SectionHeading } from "@/components/ui/section-heading";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("track");
  return { title: t("metaTitle"), description: t("lead"), robots: { index: false } };
}

export default async function TrackPage({ searchParams }: PageProps<"/[locale]/track">) {
  const t = await getTranslations("track");
  return (
    <div className="container-x py-12 sm:py-16">
      <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      <div className="mt-10">
        <Suspense fallback={<div className="h-48 rounded-xl border border-line bg-surface" />}>
          <TrackLoader searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function TrackLoader({ searchParams }: { searchParams: PageProps<"/[locale]/track">["searchParams"] }) {
  const { code } = await searchParams;
  return <TrackForm initialCode={typeof code === "string" ? code.slice(0, 12) : ""} />;
}
