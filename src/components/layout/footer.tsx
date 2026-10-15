import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Logo } from "@/components/brand/logo";
import { bookNav, mainNav } from "@/config/nav";
import { Link } from "@/i18n/navigation";
import type { SiteSettings } from "@/lib/data/settings";
import { localized } from "@/lib/i18n-field";
import { SocialLinks } from "./social-links";

export async function Footer({
  year,
  settings,
}: {
  year: number;
  settings: SiteSettings;
}) {
  const [t, tNav, locale] = await Promise.all([
    getTranslations("footer"),
    getTranslations("nav"),
    getLocale(),
  ]);

  return (
    <footer className="mt-24 border-t border-line bg-surface pb-20 lg:pb-0">
      <div className="horizon" />
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-5 lg:col-span-2">
          <Logo />
          <p className="max-w-sm text-sm leading-7 text-muted">{t("about")}</p>
          <SocialLinks label={t("follow")} settings={settings} />
        </div>

        <nav aria-label={t("quickLinks")}>
          <h2 className="mb-4 text-sm font-semibold text-ink">
            {t("quickLinks")}
          </h2>
          <ul className="space-y-2.5 text-sm">
            {[...mainNav.slice(1), bookNav].map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="text-muted transition-colors hover:text-ink"
                >
                  {tNav(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 text-sm font-semibold text-ink">
            {t("contact")}
          </h2>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand" />
              {localized(settings, "address", locale)}
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-brand" />
              <a href={`tel:${settings.phone}`} dir="ltr" className="hover:text-ink">
                {settings.phone}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-brand" />
              <a href={`mailto:${settings.email}`} className="hover:text-ink">
                {settings.email}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-brand" />
              <span>
                <span className="block text-ink">{t("hours")}</span>
                {localized(settings, "hours", locale)}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-muted sm:flex-row sm:justify-between">
          <p>{t("rights", { year })}</p>
          <p>{t("disclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}
