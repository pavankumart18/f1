import { ImageResponse } from "next/og";
import { getDriver, getDriverCareer } from "@/lib/f1/api";
import { getWikiImage } from "@/lib/f1/wiki";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Driver — The Pit Wall";

export default async function Image({
  params,
}: {
  params: Promise<{ driverId: string }>;
}) {
  const { driverId } = await params;
  const [driver, career, photo] = await Promise.all([
    getDriver(driverId),
    getDriverCareer(driverId),
    getDriver(driverId).then((d) => getWikiImage(d?.url)),
  ]);

  const accent = "#e10600";
  const name = driver
    ? `${driver.givenName} ${driver.familyName}`
    : "Formula 1";

  const stats: [string, number | string][] = career
    ? [
        ["TITLES", career.championships],
        ["WINS", career.wins],
        ["PODIUMS", career.podiums],
        ["POLES", career.poles],
      ]
    : [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0a0a0b",
          color: "#ece9e2",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ width: 16, height: "100%", background: accent, display: "flex" }} />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 64,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 34, height: 16, background: accent, display: "flex" }} />
            <div style={{ fontSize: 26, letterSpacing: 6, color: "#9b968d" }}>
              THE PIT WALL
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 40, color: "#9b968d", display: "flex" }}>
              {`${driver?.nationality ?? "Formula 1"}${
                driver?.permanentNumber ? `  ·  No. ${driver.permanentNumber}` : ""
              }`}
            </div>
            <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1, display: "flex" }}>
              {name}
            </div>
          </div>

          <div style={{ display: "flex", gap: 48 }}>
            {stats.map(([label, value]) => (
              <div key={label} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 64, fontWeight: 800, color: accent, display: "flex" }}>
                  {String(value)}
                </div>
                <div style={{ fontSize: 22, letterSpacing: 3, color: "#9b968d", display: "flex" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt=""
            width={430}
            height={630}
            style={{ width: 430, height: 630, objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 430,
              height: 630,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 240,
              fontWeight: 800,
              color: accent,
              background: "#121214",
            }}
          >
            {driver?.familyName?.[0] ?? "F1"}
          </div>
        )}
      </div>
    ),
    size
  );
}
