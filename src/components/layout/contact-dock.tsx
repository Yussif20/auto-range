import { CalendarCheck, MessageCircle, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { site, whatsappLink } from "@/config/site";
import { Link } from "@/i18n/navigation";

// Floating WhatsApp on desktop, a Call / WhatsApp / Book bar on mobile.
export function ContactDock() {
  const t = useTranslations("actions");

  return (
    <>
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("chatWhatsapp")}
        className="fixed end-6 bottom-6 z-30 hidden size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/40 transition-transform hover:scale-105 lg:grid"
      >
        <MessageCircle className="size-6" />
      </a>

      <nav
        aria-label={t("book")}
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-line bg-bg/95 backdrop-blur-md lg:hidden"
      >
        <a
          href={`tel:${site.phone}`}
          className="flex flex-col items-center gap-1 py-2.5 text-xs text-muted"
        >
          <Phone className="size-5 text-ink" />
          {t("call")}
        </a>
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 py-2.5 text-xs text-muted"
        >
          <MessageCircle className="size-5 text-[#25D366]" />
          {t("whatsapp")}
        </a>
        <Link
          href="/book"
          className="flex flex-col items-center gap-1 bg-brand py-2.5 text-xs font-semibold text-white"
        >
          <CalendarCheck className="size-5" />
          {t("book")}
        </Link>
      </nav>
    </>
  );
}
