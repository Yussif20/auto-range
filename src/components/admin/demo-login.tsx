import { FlaskConical } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { demoLogin } from "@/app/actions/admin/auth";
import { SubmitButton } from "./submit-button";

// Only rendered when DEMO_MODE=1; the action re-checks that on the server.
export async function DemoLogin() {
  const [t, locale] = await Promise.all([getTranslations("demo"), getLocale()]);
  return (
    <form
      action={demoLogin.bind(null, locale)}
      className="mb-4 rounded-xl border border-warning/30 bg-warning/10 p-5 text-center"
    >
      <p className="flex items-center justify-center gap-2 font-semibold">
        <FlaskConical className="size-4 text-warning" aria-hidden />
        {t("loginTitle")}
      </p>
      <p className="mt-1.5 text-sm text-muted">{t("loginBody")}</p>
      <SubmitButton className="mt-4 w-full">{t("loginButton")}</SubmitButton>
    </form>
  );
}
