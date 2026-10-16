"use server";

import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/auth/session";
import { isDemo } from "@/lib/demo";
import { MAX_UPLOAD_BYTES, UPLOAD_TYPES } from "@/lib/admin/uploads";

export type UploadResult = { url: string } | { error: "demo" | "type" | "size" | "server" };

const FOLDERS = new Set(["parts", "services", "models"]);
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };

/** Stores one admin photo in Vercel Blob and returns its public URL. */
export async function uploadImage(folder: string, form: FormData): Promise<UploadResult> {
  await requireAdmin();
  // The demo shows the uploader but never stores visitors' files.
  if (isDemo()) return { error: "demo" };

  const file = form.get("file");
  if (!(file instanceof File) || !FOLDERS.has(folder)) return { error: "server" };
  if (!UPLOAD_TYPES.includes(file.type)) return { error: "type" };
  if (file.size > MAX_UPLOAD_BYTES) return { error: "size" };

  try {
    const blob = await put(`${folder}/${randomUUID()}.${EXT[file.type]}`, file, {
      access: "public",
      contentType: file.type,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    return { url: blob.url };
  } catch (error) {
    console.error("uploadImage failed", error);
    return { error: "server" };
  }
}
