import { ImageResponse } from "next/og";
import { getConstructor, getConstructorStandings } from "@/lib/f1/api";
import { teamColor, teamName } from "@/lib/f1/teams";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Constructor — The Pit Wall";

export default async function Image({
  params,
}: {
  params: Promise<{ constructorId: string }>;
}) {
  const { constructorId } = await params;
  const [team, standings] = await Promise.all([
    getConstructor(constructorId),
    getConstructorStandings("current").catch(() => []),
  ]);
  const standing = standings.find(
    (s) => s.Constructor.constructorId === constructorId
  );
  const color = teamColor(constructorId);
  const name = team ? teamName(constructorId, team.name) : "Formula 1";

  const stats: [string, string][] = standing
    ? [
        ["CHAMPIONSHIP", `P${standing.position}`],
        ["POINTS", standing.points],
        ["WINS", standing.wins],
      ]
    : [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0b",
          color: "#ece9e2",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 34, height: 16, background: "#e10600", display: "flex" }} />
          <div style={{ fontSize: 26, letterSpacing: 6, color: "#9b968d" }}>
            THE PIT WALL · CONSTRUCTOR
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ width: 24, height: 150, background: color, display: "flex" }} />
          <div style={{ fontSize: 110, fontWeight: 800, lineHeight: 1 }}>{name}</div>
        </div>

        <div style={{ display: "flex", gap: 56 }}>
          {stats.map(([label, value]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 72, fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 22, letterSpacing: 3, color: "#9b968d" }}>
                {label}
              </div>
            </div>
          ))}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ fontSize: 24, color: "#9b968d" }}>
              {team?.nationality ?? ""}
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
