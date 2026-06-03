// Constructor colour tokens. Used as *accents only* (bars, dots, spines) so the
// editorial paper/ink look stays calm. Falls back to a neutral graphite.

export type TeamStyle = { name: string; color: string };

const TEAM_COLORS: Record<string, string> = {
  // 2026 grid
  mercedes: "#00D7B6",
  ferrari: "#E8002D",
  red_bull: "#3671C6",
  mclaren: "#FF8000",
  aston_martin: "#229971",
  alpine: "#0093CC",
  williams: "#1868DB",
  rb: "#6692FF",
  haas: "#9CA3AB",
  audi: "#BB0A30",
  cadillac: "#B49759",

  // recent / historical constructors (stats archive)
  sauber: "#52E252",
  alphatauri: "#5E8FAA",
  alfa: "#C92D4B",
  toro_rosso: "#469BFF",
  racing_point: "#F596C8",
  force_india: "#F596C8",
  renault: "#FFF500",
  lotus_f1: "#FFB800",
  lotus: "#005030",
  brabham: "#005030",
  tyrrell: "#0033A0",
  benetton: "#00A650",
  jordan: "#FFD700",
  jaguar: "#0A5C36",
  bmw_sauber: "#005EB8",
  honda: "#E40521",
  toyota: "#CB0000",
  brawn: "#B6FF00",
  team_lotus: "#005030",
  matra: "#0033A0",
  cooper: "#005030",
  ligier: "#0033A0",
  minardi: "#000000",
  arrows: "#FF8000",
  prost: "#0033A0",
  stewart: "#FFFFFF",
  marussia: "#6E0000",
  manor: "#ED1C24",
  caterham: "#005030",
  hrt: "#B8860B",
  virgin: "#ED1C24",
};

const TEAM_NAMES: Record<string, string> = {
  red_bull: "Red Bull",
  aston_martin: "Aston Martin",
  rb: "Racing Bulls",
  haas: "Haas",
  alphatauri: "AlphaTauri",
  toro_rosso: "Toro Rosso",
  racing_point: "Racing Point",
  force_india: "Force India",
};

export function teamColor(constructorId?: string | null): string {
  if (!constructorId) return "#8A8A8A";
  return TEAM_COLORS[constructorId] ?? "#8A8A8A";
}

export function teamName(constructorId: string, fallback: string): string {
  return TEAM_NAMES[constructorId] ?? fallback;
}
