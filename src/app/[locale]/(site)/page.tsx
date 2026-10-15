import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { Hero } from "@/components/home/hero";
import {
  CtaBand,
  Faq,
  FeaturedParts,
  ModelStrip,
  Reviews,
  ServicesSection,
  StatsBand,
  VisitUs,
  WhyUs,
} from "@/components/home/sections";
import { JsonLd } from "@/components/seo/json-ld";
import { getFaqs } from "@/lib/data/catalog";
import { getSettings } from "@/lib/data/settings";
import { localeAlternates } from "@/lib/seo";
import { businessSchema, faqSchema } from "@/lib/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  return { alternates: localeAlternates("", await getLocale()) };
}

export default async function HomePage() {
  const [settings, faqs, locale] = await Promise.all([getSettings(), getFaqs(), getLocale()]);
  return (
    <>
      <JsonLd data={[businessSchema(settings, locale), ...(faqs.length ? [faqSchema(faqs, locale)] : [])]} />
      <Hero />
      <StatsBand settings={settings} />
      <ServicesSection />
      <WhyUs />
      <ModelStrip />
      <FeaturedParts />
      <Reviews />
      <Faq />
      <CtaBand settings={settings} />
      <VisitUs settings={settings} />
    </>
  );
}
