// Fails when locale files drift apart or contain empty strings,
// so a raw key like "ft.tagline" can never ship to the page.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = join(import.meta.dirname, "..", "messages");
const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

function flatten(obj, prefix = "") {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === "object"
      ? flatten(value, path)
      : [[path, value]];
  });
}

const locales = Object.fromEntries(
  files.map((f) => [
    f.replace(".json", ""),
    new Map(flatten(JSON.parse(readFileSync(join(dir, f), "utf8")))),
  ]),
);

const allKeys = new Set(Object.values(locales).flatMap((m) => [...m.keys()]));
const problems = [];

for (const [locale, entries] of Object.entries(locales)) {
  for (const key of allKeys) {
    if (!entries.has(key)) problems.push(`${locale}: missing "${key}"`);
    else if (String(entries.get(key)).trim() === "")
      problems.push(`${locale}: empty "${key}"`);
  }
}

if (problems.length) {
  console.error(`i18n check failed:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`i18n OK: ${allKeys.size} keys in ${files.length} locales`);
