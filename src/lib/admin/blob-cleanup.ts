import "server-only";
import { del } from "@vercel/blob";
import { isBlobUrl } from "./uploads";

/** Deletes uploaded photos that a record no longer uses. Files under /public are left alone. */
export async function deleteUnusedImages(before: (string | null | undefined)[], after: (string | null | undefined)[] = []) {
  const kept = new Set(after);
  const gone = before.filter((u): u is string => !!u && !kept.has(u) && isBlobUrl(u));
  if (gone.length === 0) return;
  try {
    await del(gone);
  } catch (error) {
    // A leftover file costs a little storage; it must never fail the save.
    console.error("deleteUnusedImages failed", error);
  }
}
