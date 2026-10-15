import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SettingsForm } from "@/components/admin/settings-form";
import { PageHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { adminPage } from "@/lib/auth/session";

// Session-gated: allowed to block on navigation (see the panel layout).
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.nav");
  return { title: t("settings") };
}

export default async function SettingsPage() {
  await adminPage();
  const [t, values] = await Promise.all([
    getTranslations("admin.settings"),
    // Read straight from the DB, not the public cache, so the form is never stale.
    db.settings.findUniqueOrThrow({ where: { id: 1 }, omit: { id: true, updatedAt: true } }),
  ]);
  return (
    <>
      <PageHeader title={t("title")} lead={t("lead")} />
      <SettingsForm values={values} />
    </>
  );
}
