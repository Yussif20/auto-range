// Reads a bilingual column pair, e.g. localized(part, "name", "ar") -> part.nameAr.
type Pair<K extends string> = Record<`${K}Ar` | `${K}En`, string>;

export function localized<K extends string>(row: Pair<K>, key: K, locale: string) {
  return locale === "ar" ? row[`${key}Ar`] : row[`${key}En`];
}
