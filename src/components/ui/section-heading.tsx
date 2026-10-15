import clsx from "clsx";

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "start",
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "start" | "center";
  as?: "h1" | "h2";
}) {
  return (
    <div className={clsx("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && (
        <p
          className={clsx(
            "mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-brand-text uppercase",
            align === "center" && "justify-center",
          )}
        >
          <span className="h-px w-6 bg-brand" />
          {eyebrow}
        </p>
      )}
      <Tag className={clsx("font-bold text-ink", Tag === "h1" ? "text-3xl sm:text-5xl" : "text-2xl sm:text-4xl")}>
        {title}
      </Tag>
      {lead && <p className="mt-4 leading-8 text-muted">{lead}</p>}
    </div>
  );
}
