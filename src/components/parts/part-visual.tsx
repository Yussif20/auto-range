import clsx from "clsx";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";

// Real photo when the part has one, otherwise a branded placeholder by category.
export function PartVisual({
  image,
  icon,
  alt,
  className,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  priority,
}: {
  image?: string;
  icon: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden bg-[radial-gradient(circle_at_50%_40%,var(--surface-2),var(--bg)_75%)]",
        className,
      )}
    >
      {image ? (
        <Image src={image} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <div className="absolute inset-x-6 top-1/2 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
          <span className="relative grid size-16 place-items-center rounded-full border border-line bg-surface text-muted">
            <Icon name={icon} className="size-7" />
          </span>
        </div>
      )}
    </div>
  );
}
