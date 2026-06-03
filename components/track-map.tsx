// Draws a circuit outline from [lon, lat] coordinates as a normalized SVG path.
// Mercator-ish: we just use raw lon/lat scaled to the box (fine at circuit scale)
// and flip Y so north is up.

export function TrackMap({
  coords,
  className,
}: {
  coords: number[][];
  className?: string;
}) {
  if (!coords || coords.length < 3) return null;

  const lons = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const W = 100;
  const H = 100;
  const pad = 8;
  const spanLon = maxLon - minLon || 1;
  const spanLat = maxLat - minLat || 1;
  const scale = Math.min((W - pad * 2) / spanLon, (H - pad * 2) / spanLat);
  const offX = (W - spanLon * scale) / 2;
  const offY = (H - spanLat * scale) / 2;

  const pts = coords.map(([lon, lat]) => {
    const x = (lon - minLon) * scale + offX;
    const y = H - ((lat - minLat) * scale + offY); // flip Y
    return [x, y];
  });

  const d =
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ") +
    " Z";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-label="Circuit layout"
    >
      <path
        d={d}
        fill="none"
        stroke="var(--rule-strong)"
        strokeWidth={4}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={d}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
