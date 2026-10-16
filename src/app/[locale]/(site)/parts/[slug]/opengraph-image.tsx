import { ImageResponse } from "next/og";
import { getPart } from "@/lib/data/catalog";
import { OG_SIZE, OgFrame } from "@/lib/og";

export const alt = "Genuine Land Rover part at Auto Range";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function PartOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const part = await getPart(slug);
  const price = part?.price != null ? `EGP ${part.price.toLocaleString("en-US")}` : "Price on request";

  return new ImageResponse(
    (
      <OgFrame footer="Genuine parts · Order on WhatsApp · Fitting in-house">
        <div style={{ fontSize: 26, color: "#A1A1AA", letterSpacing: 4 }}>{(part?.brand ?? "Genuine Land Rover").toUpperCase()}</div>
        <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1, marginTop: 12 }}>
          {part?.nameEn ?? "Genuine Land Rover parts"}
        </div>
        <div style={{ fontSize: 40, fontWeight: 700, color: "#E0283F", marginTop: 20 }}>{price}</div>
      </OgFrame>
    ),
    size,
  );
}
