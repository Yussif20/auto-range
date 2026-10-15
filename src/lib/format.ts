// Latin digits in both languages: phone numbers, OEM codes and prices then read
// the same everywhere, and match what next-intl prints for ICU plurals.
export function numberLocale(locale: string) {
  return locale === "ar" ? "ar-EG-u-nu-latn" : "en-EG";
}

export function formatPrice(amount: number, locale: string) {
  return new Intl.NumberFormat(numberLocale(locale), {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(amount);
}
