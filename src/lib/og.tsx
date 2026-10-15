// Shared look for Open Graph cards. Latin text only: the OG renderer doesn't
// shape Arabic script, so both locales share the English wordmark.
export const OG_SIZE = { width: 1200, height: 630 };

export function OgFrame({ children, footer }: { children: React.ReactNode; footer: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        background: "radial-gradient(ellipse 70% 60% at 85% 0%, #5a0816 0%, #0A0A0B 65%)",
        color: "#F4F4F5",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <svg width="64" height="64" viewBox="0 0 48 48">
          <path d="M21 7h7L15.5 41h-7z" fill="#C8102E" />
          <path d="M20.5 7h7L39.5 41h-7z" fill="#F4F4F5" />
          <path d="M2 28.5h44v3.5H2z" fill="#C8102E" />
        </svg>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: 8 }}>
          AUTO<span style={{ color: "#C8102E", marginLeft: 14 }}>RANGE</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>{children}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ height: 3, background: "linear-gradient(90deg, #C8102E, rgba(200,16,46,0))" }} />
        <div style={{ fontSize: 24, color: "#A1A1AA" }}>{footer}</div>
      </div>
    </div>
  );
}
