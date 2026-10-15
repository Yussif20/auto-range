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
import { getSettings } from "@/lib/data/settings";

export default async function HomePage() {
  const settings = await getSettings();
  return (
    <>
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
