import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ResourceForm } from "@/components/admin/resource-form";
import { PageHeader } from "@/components/admin/ui";
import { Link } from "@/i18n/navigation";
import { formOptions, loadRecord, NEW_DEFAULTS } from "@/lib/admin/resource-data";
import { isResource } from "@/lib/admin/resources";
import { adminPage } from "@/lib/auth/session";

// Session-gated: allowed to block on navigation (see the panel layout).
export const instant = false;

export async function generateMetadata({ params }: PageProps<"/[locale]/admin/[resource]/[id]">) {
  const { resource, id } = await params;
  if (!isResource(resource)) return {};
  const [t, tNav] = await Promise.all([getTranslations("admin.resources"), getTranslations("admin.nav")]);
  return { title: `${id === "new" ? t("newTitle") : t("editTitle")} · ${tNav(resource)}` };
}

export default async function ResourceEditPage({ params }: PageProps<"/[locale]/admin/[resource]/[id]">) {
  await adminPage();
  const { resource, id } = await params;
  if (!isResource(resource)) notFound();

  const isNew = id === "new";
  const [t, tNav, record, options] = await Promise.all([
    getTranslations("admin.resources"),
    getTranslations("admin.nav"),
    isNew ? Promise.resolve(NEW_DEFAULTS[resource]) : loadRecord(resource, id),
    formOptions(),
  ]);
  if (!record) notFound();

  return (
    <>
      <Link href={`/admin/${resource}`} className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ChevronRight className="size-4 ltr:rotate-180" />
        {tNav(resource)}
      </Link>
      <PageHeader title={isNew ? t("newTitle") : t("editTitle")} />
      <ResourceForm resource={resource} id={isNew ? null : id} values={record} options={options} />
    </>
  );
}
