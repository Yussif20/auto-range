import { FlaskConical } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function DemoBanner({ showAdminLink = true }: { showAdminLink?: boolean }) {
  const t = await getTranslations("demo");
  return (
    <div className="relative z-50 border-b border-warning/30 bg-warning/10 px-4 py-2 text-center text-xs text-ink sm:text-sm">
      <FlaskConical className="me-1.5 inline size-4 text-warning" aria-hidden />
      {t("banner")}
      {showAdminLink && (
        <>
          {" "}
          <Link href="/admin/login" className="font-semibold text-warning underline-offset-2 hover:underline">
            {t("tryAdmin")}
          </Link>
        </>
      )}
    </div>
  );
}
