import { isDemo } from "@/lib/demo";

export function whatsappLink(number: string, message?: string) {
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  // The demo never targets a number: WhatsApp opens its contact picker with
  // the message filled in, so a click can't reach a stranger.
  const target = isDemo() ? "" : number.replace(/\D/g, "");
  return `https://wa.me/${target}${text}`;
}
