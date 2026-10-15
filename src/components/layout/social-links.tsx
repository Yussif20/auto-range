import type { SiteSettings } from "@/lib/data/settings";

// Simple brand glyphs (Lucide no longer ships brand icons).
const icons = {
  facebook:
    "M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.2C16.3 2.1 15.3 2 14.2 2 11.8 2 10.2 3.5 10.2 6.1v2.4H7.5v3.7h2.7V22H14v-9.8h2.7l.4-3.7z",
  instagram:
    "M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2zM17 5.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zM21.9 7.9c-.1-1.6-.4-3-1.6-4.2S17.7 2.2 16.1 2.1C14.5 2 9.5 2 7.9 2.1 6.3 2.2 4.9 2.5 3.7 3.7S2.2 6.3 2.1 7.9C2 9.5 2 14.5 2.1 16.1c.1 1.6.4 3 1.6 4.2s2.6 1.5 4.2 1.6c1.6.1 6.6.1 8.2 0 1.6-.1 3-.4 4.2-1.6s1.5-2.6 1.6-4.2c.1-1.6.1-6.6 0-8.2zm-2.1 10a3.2 3.2 0 0 1-1.8 1.8c-1.3.5-4.3.4-5.6.4s-4.4.1-5.6-.4a3.2 3.2 0 0 1-1.8-1.8c-.5-1.3-.4-4.3-.4-5.6s-.1-4.4.4-5.6A3.2 3.2 0 0 1 6.4 4.4C7.6 3.9 10.7 4 12 4s4.4-.1 5.6.4a3.2 3.2 0 0 1 1.8 1.8c.5 1.3.4 4.3.4 5.6s.1 4.4-.4 5.6z",
  tiktok:
    "M16.6 2h-3.4v13.6a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .8.1V9.3a6.3 6.3 0 1 0 5.5 6.3V8.8a8 8 0 0 0 4.4 1.3V6.7A4.4 4.4 0 0 1 16.6 2z",
  youtube:
    "M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3z",
} as const;

export function SocialLinks({
  label,
  settings,
}: {
  label: string;
  settings: SiteSettings;
}) {
  const names = (Object.keys(icons) as (keyof typeof icons)[]).filter(
    (name) => settings[name],
  );
  return (
    <ul aria-label={label} className="flex gap-2">
      {names.map((name) => (
        <li key={name}>
          <a
            href={settings[name]!}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name}
            className="grid size-10 place-items-center rounded-md border border-line text-muted transition-colors hover:border-brand hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
              <path d={icons[name]} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
