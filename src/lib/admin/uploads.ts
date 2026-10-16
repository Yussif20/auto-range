// Upload rules shared by the image field (browser) and the upload and save actions.
export const UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
/** Photos are shrunk in the browser first; this only stops oversized originals. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_PART_IMAGES = 8;

export const isBlobUrl = (url: string) => {
  try {
    return new URL(url).hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
};
