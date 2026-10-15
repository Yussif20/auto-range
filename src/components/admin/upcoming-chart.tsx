"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

type Day = { date: string; label: string; full: string; count: number };

// Single-series bar chart: bookings per open day against daily capacity.
// One series, so no legend (the card title names it); a table view sits beneath.
export function UpcomingChart({ data, capacity }: { data: Day[]; capacity: number }) {
  const t = useTranslations("admin.dashboard.upcoming");
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(capacity, ...data.map((d) => d.count), 1);
  const busiest = data.reduce((best, d, i) => (d.count > data[best].count ? i : best), 0);

  return (
    <div className="mt-6">
      <div className="relative h-48" onMouseLeave={() => setHover(null)}>
        {/* Recessive gridlines at 0, 50% and 100% of capacity. */}
        {[0, 0.5, 1].map((f) => (
          <div
            key={f}
            className="absolute inset-x-0 border-t border-line/70"
            style={{ bottom: `${(f * capacity * 100) / max}%` }}
          >
            <span className="absolute -top-2.5 end-0 bg-surface ps-1 text-[0.65rem] text-muted tabular-nums">
              {Math.round(f * capacity)}
            </span>
          </div>
        ))}
        <ol className="absolute inset-0 flex items-end gap-0.5 pe-6">
          {data.map((d, i) => (
            <li
              key={d.date}
              className="relative flex h-full flex-1 items-end"
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              tabIndex={0}
              aria-label={t("bar", { day: d.full, count: d.count })}
            >
              <div
                className="w-full rounded-t-[4px] transition-opacity"
                style={{
                  height: `${(d.count / max) * 100}%`,
                  minHeight: d.count ? 3 : 0,
                  background: "#E0283F",
                  opacity: hover === null || hover === i ? 1 : 0.45,
                }}
              />
              {i === busiest && d.count > 0 && hover === null && (
                <span
                  className="absolute inset-x-0 text-center text-xs text-ink tabular-nums"
                  style={{ bottom: `calc(${(d.count / max) * 100}% + 2px)` }}
                >
                  {d.count}
                </span>
              )}
              {hover === i && (
                <span
                  role="tooltip"
                  className="pointer-events-none absolute start-1/2 z-10 -translate-x-1/2 rounded-md border border-line bg-bg px-2.5 py-1.5 text-xs whitespace-nowrap text-ink shadow-lg rtl:translate-x-1/2"
                  style={{ bottom: `calc(${(d.count / max) * 100}% + 6px)` }}
                >
                  <span className="block text-muted">{d.full}</span>
                  {t("tooltip", { count: d.count, capacity })}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
      <ol className="mt-2 flex gap-0.5 pe-6 text-center text-[0.65rem] text-muted" aria-hidden>
        {data.map((d, i) => (
          <li key={d.date} className="flex-1 truncate">
            {i % 2 === 0 ? d.label : ""}
          </li>
        ))}
      </ol>
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-muted hover:text-ink">{t("table")}</summary>
        <table className="mt-3 w-full text-start">
          <tbody className="divide-y divide-line">
            {data.map((d) => (
              <tr key={d.date}>
                <td className="py-1.5 text-muted">{d.full}</td>
                <td className="py-1.5 text-end tabular-nums">{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
