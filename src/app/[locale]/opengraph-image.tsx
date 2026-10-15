import { ImageResponse } from "next/og";
import { OG_SIZE, OgFrame } from "@/lib/og";

export const alt = "Auto Range: Land Rover & Range Rover specialists";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <OgFrame footer="Servicing · Diagnostics · Genuine parts · Online booking">
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>Specialist care</div>
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, color: "#E0283F" }}>
          for every Range Rover
        </div>
      </OgFrame>
    ),
    size,
  );
}
