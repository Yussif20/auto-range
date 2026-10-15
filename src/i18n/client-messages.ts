import type { AbstractIntlMessages } from "next-intl";

// Only these messages reach the browser on public pages: the ones Client
// Components read. Server Components translate on the server and need none.
// When a new Client Component calls useTranslations, add its namespace here.
const CLIENT_PATHS = [
  "nav",
  "actions",
  "requestList",
  "parts.filters",
  "book",
  "track",
  "bookingStatus",
  "contact.form",
  "errorPages",
];

export function pickClientMessages(messages: AbstractIntlMessages) {
  const out: AbstractIntlMessages = {};
  for (const path of CLIENT_PATHS) {
    const keys = path.split(".");
    let src: unknown = messages;
    let dst: AbstractIntlMessages = out;
    keys.forEach((key, i) => {
      src = (src as AbstractIntlMessages | undefined)?.[key];
      if (src === undefined) return;
      if (i === keys.length - 1) dst[key] = src as AbstractIntlMessages;
      else dst = (dst[key] ??= {}) as AbstractIntlMessages;
    });
  }
  return out;
}
