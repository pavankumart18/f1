// Real circuit layout outlines from the open `f1-circuits` GeoJSON dataset.
// We match a circuit by nearest centroid to the lat/long Jolpica gives us
// (their feature ids don't line up with Ergast circuitIds).

const SRC =
  "https://raw.githubusercontent.com/bacinger/f1-circuits/master/f1-circuits.geojson";

type Feature = {
  properties: { Name?: string };
  geometry: { type: string; coordinates: number[][] | number[][][] };
};

let cached: Feature[] | null = null;

async function load(): Promise<Feature[]> {
  if (cached) return cached;
  try {
    const res = await fetch(SRC, { next: { revalidate: 7 * 24 * 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    cached = data.features as Feature[];
    return cached;
  } catch {
    return [];
  }
}

function lineCoords(f: Feature): number[][] {
  const g = f.geometry;
  if (g.type === "LineString") return g.coordinates as number[][];
  if (g.type === "MultiLineString") {
    // pick the longest segment
    const parts = g.coordinates as number[][][];
    return parts.reduce((a, b) => (b.length > a.length ? b : a), parts[0] ?? []);
  }
  return [];
}

function centroid(coords: number[][]): [number, number] {
  const s = coords.reduce(
    (acc, [lon, lat]) => [acc[0] + lon, acc[1] + lat],
    [0, 0]
  );
  return [s[0] / coords.length, s[1] / coords.length];
}

export async function getCircuitTrack(
  lat: string | number,
  long: string | number
): Promise<number[][] | null> {
  const features = await load();
  if (!features.length) return null;
  const tLat = Number(lat);
  const tLon = Number(long);

  let best: { d: number; coords: number[][] } | null = null;
  for (const f of features) {
    const coords = lineCoords(f);
    if (coords.length < 3) continue;
    const [cLon, cLat] = centroid(coords);
    const d = (cLat - tLat) ** 2 + (cLon - tLon) ** 2;
    if (!best || d < best.d) best = { d, coords };
  }
  // ~0.3 degrees tolerance so we don't show the wrong track
  if (!best || best.d > 0.09) return null;
  return best.coords;
}
