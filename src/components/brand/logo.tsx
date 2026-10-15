import { LogoMark } from "./logo-mark";

// Bilingual lockup: Latin wordmark with the Arabic name underneath.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="size-8 shrink-0 text-ink sm:size-9" />
      <span className="flex flex-col items-start leading-none">
        <span
          dir="ltr"
          className="font-display text-base font-bold tracking-[0.12em] whitespace-nowrap text-ink uppercase sm:text-lg sm:tracking-[0.18em]"
        >
          Auto <span className="text-brand">Range</span>
        </span>
        <span className="mt-1 text-[0.7rem] text-muted" lang="ar">
          أوتو رينج
        </span>
      </span>
    </span>
  );
}
