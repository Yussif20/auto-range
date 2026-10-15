import type { Faq, Part, Service, StockStatus } from "@prisma/client";
import type { SiteSettings } from "@/lib/data/settings";
import { localized } from "@/lib/i18n-field";
import { absoluteUrl } from "@/lib/seo";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** AutoRepair (a LocalBusiness) built from the Settings row. */
export function businessSchema(settings: SiteSettings, locale: string) {
  const slots = [...settings.slots].sort();
  const lastHour = Number(slots.at(-1)?.slice(0, 2) ?? 18) + 1;
  return {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "@id": absoluteUrl("/#business"),
    name: locale === "ar" ? "أوتو رينج" : "Auto Range",
    alternateName: locale === "ar" ? "Auto Range" : "أوتو رينج",
    url: absoluteUrl(`/${locale}`),
    logo: absoluteUrl("/icon.svg"),
    telephone: settings.phone,
    email: settings.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: localized(settings, "address", locale),
      addressCountry: "EG",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAY_NAMES.filter((_, i) => !settings.closedWeekdays.includes(i)),
        opens: slots[0] ?? "09:00",
        closes: `${String(lastHour).padStart(2, "0")}:00`,
      },
    ],
    sameAs: [settings.facebook, settings.instagram, settings.tiktok, settings.youtube].filter(Boolean),
    knowsAbout: ["Land Rover", "Range Rover", "Range Rover Sport", "Defender", "Discovery"],
  };
}

export function faqSchema(faqs: Faq[], locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: localized(f, "question", locale),
      acceptedAnswer: { "@type": "Answer", text: localized(f, "answer", locale) },
    })),
  };
}

const AVAILABILITY: Record<StockStatus, string> = {
  IN_STOCK: "https://schema.org/InStock",
  LOW_STOCK: "https://schema.org/LimitedAvailability",
  ON_ORDER: "https://schema.org/PreOrder",
  OUT_OF_STOCK: "https://schema.org/OutOfStock",
};

export function productSchema(part: Part, locale: string) {
  const url = absoluteUrl(`/${locale}/parts/${part.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: localized(part, "name", locale),
    description: localized(part, "desc", locale),
    sku: part.oemNumber,
    mpn: part.oemNumber,
    brand: { "@type": "Brand", name: part.brand },
    url,
    ...(part.images[0] && { image: part.images.map((i) => (i.startsWith("/") ? absoluteUrl(i) : i)) }),
    ...(part.price != null && {
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "EGP",
        price: part.price,
        availability: AVAILABILITY[part.stock],
        seller: { "@id": absoluteUrl("/#business") },
      },
    }),
  };
}

export function serviceSchema(service: Service, locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: localized(service, "title", locale),
    description: localized(service, "summary", locale),
    serviceType: localized(service, "title", locale),
    provider: { "@id": absoluteUrl("/#business") },
    areaServed: { "@type": "Country", name: "Egypt" },
    ...(service.priceFrom != null && {
      offers: { "@type": "Offer", priceCurrency: "EGP", price: service.priceFrom },
    }),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
