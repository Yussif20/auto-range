// Short, unambiguous reference codes (no 0/O, 1/I) for bookings and part requests.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function referenceCode(prefix: "AR" | "PR", length = 5) {
  let code = "";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  for (const b of bytes) code += ALPHABET[b % ALPHABET.length];
  return `${prefix}-${code}`;
}
