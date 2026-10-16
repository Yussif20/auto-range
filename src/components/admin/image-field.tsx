"use client";

import clsx from "clsx";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { uploadImage } from "@/app/actions/admin/uploads";
import { MAX_PART_IMAGES, MAX_UPLOAD_BYTES, UPLOAD_TYPES } from "@/lib/admin/uploads";

const MAX_SIDE = 1600;

/** Shrinks a photo to at most 1600px on its long side and re-encodes it as WebP. */
async function shrink(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
    // Some browsers can't encode WebP and hand back PNG; keep whichever is smaller.
    if (blob && UPLOAD_TYPES.includes(blob.type) && blob.size < file.size) {
      return new File([blob], file.name.replace(/\.\w+$/, "") + (blob.type === "image/webp" ? ".webp" : ".png"), { type: blob.type });
    }
  } catch {
    // Formats the browser can't decode go up as they are and are checked on the server.
  }
  return file;
}

type Props = {
  name: string;
  folder: "parts" | "services" | "models";
  multiple?: boolean;
  initial: string[];
  invalid?: boolean;
};

/** Upload, preview, reorder and remove photos. Submits the URLs as hidden inputs named `name`. */
export function ImageField({ name, folder, multiple = false, initial, invalid }: Props) {
  const t = useTranslations("admin.resources.upload");
  const inputId = useId();
  const [urls, setUrls] = useState(initial.filter(Boolean));
  const [pending, setPending] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const room = multiple ? MAX_PART_IMAGES - urls.length : 1;

  async function add(files: File[]) {
    setError(null);
    const picked = files.filter((f) => f.type.startsWith("image/") || f.name.match(/\.(heic|heif)$/i));
    if (picked.length === 0) return;
    const batch = picked.slice(0, multiple ? Math.max(room, 0) : 1);
    if (batch.length < picked.length) setError(t("tooMany", { max: MAX_PART_IMAGES }));
    setPending((n) => n + batch.length);

    await Promise.all(
      batch.map(async (original) => {
        try {
          const file = await shrink(original);
          if (file.size > MAX_UPLOAD_BYTES) return setError(t("errors.size"));
          const form = new FormData();
          form.append("file", file);
          const result = await uploadImage(folder, form);
          if ("error" in result) return setError(t(`errors.${result.error}`));
          setUrls((current) => (multiple ? [...current, result.url] : [result.url]));
        } catch {
          setError(t("errors.server"));
        } finally {
          setPending((n) => n - 1);
        }
      }),
    );
  }

  const remove = (url: string) => setUrls((current) => current.filter((u) => u !== url));
  const makeMain = (url: string) => setUrls((current) => [url, ...current.filter((u) => u !== url)]);

  return (
    <div>
      {urls.map((url) => (
        <input key={url} type="hidden" name={name} value={url} />
      ))}

      {(urls.length > 0 || pending > 0) && (
        <ul className={clsx("mb-3 grid gap-3", multiple ? "grid-cols-2 sm:grid-cols-4" : "max-w-xs grid-cols-1")}>
          {urls.map((url, i) => (
            <li key={url} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-bg">
              {/* Admin preview of a stored or just-uploaded photo; next/image adds nothing here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="size-full object-cover" />
              {multiple && i === 0 && (
                <span className="absolute start-2 top-2 rounded bg-brand px-2 py-0.5 text-[0.7rem] font-semibold text-white">
                  {t("main")}
                </span>
              )}
              <div className="absolute end-2 top-2 flex gap-1.5">
                {multiple && i > 0 && (
                  <button
                    type="button"
                    onClick={() => makeMain(url)}
                    title={t("makeMain")}
                    aria-label={t("makeMain")}
                    className="grid size-8 place-items-center rounded-md bg-black/70 text-white hover:bg-black"
                  >
                    <Star className="size-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(url)}
                  title={t("remove")}
                  aria-label={t("remove")}
                  className="grid size-8 place-items-center rounded-md bg-black/70 text-white hover:bg-brand"
                >
                  <X className="size-4" />
                </button>
              </div>
            </li>
          ))}
          {Array.from({ length: pending }, (_, i) => (
            <li key={`pending-${i}`} className="grid aspect-[4/3] place-items-center rounded-lg border border-line bg-bg text-muted">
              <Loader2 className="size-6 animate-spin" aria-label={t("uploading")} />
            </li>
          ))}
        </ul>
      )}

      {room > 0 || !multiple ? (
        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void add([...e.dataTransfer.files]);
          }}
          className={clsx(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center text-sm transition-colors",
            dragging ? "border-brand bg-brand/10" : invalid ? "border-brand-hover" : "border-line hover:border-muted",
          )}
        >
          <ImagePlus className="size-6 text-brand-text" />
          <span className="font-medium text-ink">
            {multiple ? t("dropMany") : urls.length ? t("replace") : t("dropOne")}
          </span>
          <span className="text-xs text-muted">{t("hint")}</span>
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/heic"
            multiple={multiple}
            className="sr-only"
            onChange={(e) => {
              void add([...(e.target.files ?? [])]);
              e.target.value = "";
            }}
          />
        </label>
      ) : (
        <p className="text-xs text-muted">{t("full", { max: MAX_PART_IMAGES })}</p>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs text-brand-text">
          {error}
        </p>
      )}
    </div>
  );
}
