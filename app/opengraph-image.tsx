import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "The Pit Wall — Formula 1 Dashboard";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f4f1ea",
          color: "#16130f",
          padding: 72,
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 40, height: 18, background: "#e10600", display: "flex" }} />
          <div
            style={{
              fontSize: 28,
              letterSpacing: 8,
              color: "#5f594f",
              fontFamily: "sans-serif",
            }}
          >
            FORMULA 1 · 1950—2026
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 150,
              fontWeight: 800,
              lineHeight: 0.95,
              display: "flex",
              alignItems: "baseline",
            }}
          >
            <span>The&nbsp;</span>
            <span style={{ color: "#e10600", fontStyle: "italic" }}>Pit Wall</span>
            <span>.</span>
          </div>
          <div
            style={{
              fontSize: 34,
              color: "#5f594f",
              marginTop: 16,
              fontFamily: "sans-serif",
            }}
          >
            Live timing · standings · circuits · a stats archive back to 1950.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 40,
            fontSize: 24,
            letterSpacing: 3,
            color: "#5f594f",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ display: "flex" }}>DRIVERS</div>
          <div style={{ display: "flex" }}>CONSTRUCTORS</div>
          <div style={{ display: "flex" }}>RECORDS</div>
          <div style={{ display: "flex" }}>LIVE</div>
        </div>
      </div>
    ),
    size
  );
}
