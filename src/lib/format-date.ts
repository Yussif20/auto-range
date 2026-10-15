// Dates are stored as calendar days (UTC midnight) and slots as "HH:mm",
// so both are formatted in UTC to avoid shifting by the viewer's timezone.

const dateLocale = (locale: string) => (locale === "ar" ? "ar-EG-u-nu-latn" : "en-GB");

export function formatDay(iso: string, locale: string, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat(dateLocale(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    ...options,
  }).format(new Date(`${iso}T00:00:00Z`));
}

export function formatSlot(slot: string, locale: string) {
  const [h, m] = slot.split(":").map(Number);
  return new Intl.DateTimeFormat(dateLocale(locale), {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2000, 0, 1, h, m)));
}

export function formatDateTime(isoDateTime: string, locale: string) {
  return new Intl.DateTimeFormat(dateLocale(locale), {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Africa/Cairo",
  }).format(new Date(isoDateTime));
}
