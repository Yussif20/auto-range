// Placeholder business details. Phase 2 moves these into the Settings table
// so the owner can edit them from the admin.
export const site = {
  name: { ar: "أوتو رينج", en: "Auto Range" },
  phone: "+201000000000",
  whatsapp: "201000000000",
  email: "info@autorange.example",
  socials: {
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    youtube: "https://youtube.com/",
  },
} as const;

export function whatsappLink(message?: string) {
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${site.whatsapp}${text}`;
}
