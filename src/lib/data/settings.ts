import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";

export const SETTINGS_TAG = "settings";

export async function getSettings() {
  "use cache";
  cacheTag(SETTINGS_TAG);
  cacheLife("hours");
  return db.settings.findUniqueOrThrow({ where: { id: 1 } });
}

export type SiteSettings = Awaited<ReturnType<typeof getSettings>>;
