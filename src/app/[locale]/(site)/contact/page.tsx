import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/contact/contact-form";
import { SectionHeading } from "@/components/ui/section-heading";
import { getSettings } from "@/lib/data/settings";
import { localized } from "@/lib/i18n-field";
import { whatsappLink } from "@/lib/whatsapp";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact");
  return { title: t("metaTitle"), description: t("lead"), alternates: localeAlternates("/contact", await getLocale()) };
}

export default async function ContactPage() {
  const [t, locale, settings] = await Promise.all([getTranslations("contact"), getLocale(), getSettings()]);

  const channels = [
    { icon: Phone, label: t("channels.call"), value: settings.phone, href: `tel:${settings.phone}`, ltr: true },
    {
      icon: MessageCircle,
      label: t("channels.whatsapp"),
      value: t("channels.whatsappValue"),
      href: whatsappLink(settings.whatsapp),
      external: true,
    },
    { icon: Mail, label: t("channels.email"), value: settings.email, href: `mailto:${settings.email}` },
    { icon: MapPin, label: t("channels.visit"), value: localized(settings, "address", locale) },
    { icon: Clock, label: t("channels.hours"), value: localized(settings, "hours", locale) },
  ];

  return (
    <div className="container-x py-12 sm:py-16">
      <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />

      <div className="mt-12 grid gap-8 lg:grid-cols-[2fr_3fr]">
        <ul className="space-y-3">
          {channels.map(({ icon: ChannelIcon, label, value, href, ltr, external }) => {
            const body = (
              <>
                <span className="grid size-11 shrink-0 place-items-center rounded-md border border-line bg-bg text-brand">
                  <ChannelIcon className="size-5" />
                </span>
                <span>
                  <span className="block text-xs text-muted">{label}</span>
                  <span className="mt-0.5 block font-semibold" dir={ltr ? "ltr" : undefined}>
                    {value}
                  </span>
                </span>
              </>
            );
            return (
              <li key={label}>
                {href ? (
                  <a
                    href={href}
                    {...(external && { target: "_blank", rel: "noopener noreferrer" })}
                    className="flex items-center gap-4 rounded-lg border border-line bg-surface p-4 transition-colors hover:border-brand/60"
                  >
                    {body}
                  </a>
                ) : (
                  <div className="flex items-center gap-4 rounded-lg border border-line bg-surface p-4">{body}</div>
                )}
              </li>
            );
          })}
        </ul>

        <ContactForm />
      </div>

      <iframe
        title={t("mapTitle")}
        src={settings.mapUrl}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="mt-12 aspect-[16/7] min-h-72 w-full rounded-xl border border-line grayscale-[0.6] invert-[0.92] hue-rotate-180"
      />
    </div>
  );
}
