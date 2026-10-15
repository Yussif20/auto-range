type Props = { className?: string; title?: string; mono?: boolean };

// An "A" whose crossbar runs past both legs: the horizon line behind the name.
// `mono` paints every stroke in currentColor (for watermarks and backdrops).
export function LogoMark({ className, title, mono = false }: Props) {
  const red = mono ? "currentColor" : "var(--red-600)";
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d="M21 7h7L15.5 41h-7z" fill={red} />
      <path d="M20.5 7h7L39.5 41h-7z" fill="currentColor" />
      <path d="M2 28.5h44v3.5H2z" fill={red} />
      {!mono && <path d="M2 28.5h44v1.2H2z" fill="var(--red-500)" />}
    </svg>
  );
}
