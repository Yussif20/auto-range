import { revalidateTag } from "next/cache";
import { connection } from "next/server";
import { DEMO_FLAG, runSeed } from "../../../../../prisma/seed/run";
import { CATALOG_TAG, CONTENT_TAG } from "@/lib/data/catalog";
import { SETTINGS_TAG } from "@/lib/data/settings";
import { db } from "@/lib/db";
import { isDemo } from "@/lib/demo";

// Nightly reset of the public demo (Vercel Cron, see vercel.json).
// Three locks, all required: DEMO_MODE=1 on the deployment, the cron secret,
// and the DEMO_DATABASE flag row that only the demo database contains.
// On the real site DEMO_MODE is unset, so this route is a 404.
export async function GET(request: Request) {
  // Always evaluated per request, never at build time.
  await connection();
  if (!isDemo()) return new Response("Not found", { status: 404 });

  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const flag = await db.appFlag.findUnique({ where: { key: DEMO_FLAG } });
  if (!flag) {
    return new Response("This database is not marked as the demo database.", { status: 409 });
  }

  const result = await runSeed(db, { sampleData: true, demo: true });
  for (const tag of [CATALOG_TAG, CONTENT_TAG, SETTINGS_TAG]) revalidateTag(tag, { expire: 0 });

  return Response.json({ ok: true, ...result, at: new Date().toISOString() });
}
