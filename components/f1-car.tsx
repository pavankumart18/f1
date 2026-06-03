// Stylised side-profile F1 car (nose pointing right → driving direction).
// `color` paints the livery; wheels stay dark. Optional spinning wheels.

export function F1Car({
  color = "#e10600",
  className,
  spinning = false,
}: {
  color?: string;
  className?: string;
  spinning?: boolean;
}) {
  const dark = "#16151a";
  const wheelClass = spinning ? "wheel-spin" : "";
  return (
    <svg
      viewBox="0 0 480 150"
      className={className}
      role="img"
      aria-label="Formula 1 car"
      fill="none"
    >
      {/* ground shadow */}
      <ellipse cx="240" cy="143" rx="205" ry="7" fill="#000" opacity="0.16" />

      {/* rear wing (left) */}
      <path d={`M6 40 H66 V52 H6 Z`} fill={color} />
      <rect x="8" y="40" width="9" height="58" fill={dark} />
      <path d={`M22 84 H60 V93 H22 Z`} fill={color} />

      {/* floor / diffuser */}
      <path d="M44 98 L432 98 L432 112 L64 112 Z" fill={dark} />

      {/* main body: rear → airbox → cockpit → long nose → tip */}
      <path
        d="M58 100
           L62 70
           C 92 58, 122 56, 152 54
           L174 42
           C 184 40, 190 45, 192 53
           L212 68
           L252 68
           C 305 68, 350 80, 472 88
           L472 100
           Z"
        fill={color}
      />
      {/* sidepod shading */}
      <path
        d="M212 72 C 252 74, 305 82, 362 94 L362 100 L212 100 Z"
        fill={dark}
        opacity="0.22"
      />

      {/* halo + helmet */}
      <path
        d="M214 66 C 226 40, 252 40, 264 47"
        stroke={dark}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <line x1="239" y1="45" x2="239" y2="60" stroke={dark} strokeWidth="4" />
      <circle cx="233" cy="62" r="8" fill={dark} />

      {/* front wing (right) */}
      <path d="M430 104 H478 V112 H430 Z" fill={color} />
      <path d="M450 113 H478 V121 H450 Z" fill={color} />
      <rect x="470" y="98" width="9" height="26" fill={dark} />

      {/* wheels */}
      <g className={wheelClass} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <circle cx="116" cy="112" r="31" fill={dark} />
        <circle cx="116" cy="112" r="15" fill="none" stroke={color} strokeWidth="3" />
        <circle cx="116" cy="112" r="4" fill={color} />
        <line x1="116" y1="97" x2="116" y2="127" stroke={color} strokeWidth="2" opacity="0.7" />
        <line x1="101" y1="112" x2="131" y2="112" stroke={color} strokeWidth="2" opacity="0.7" />
      </g>
      <g className={wheelClass} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <circle cx="376" cy="112" r="31" fill={dark} />
        <circle cx="376" cy="112" r="15" fill="none" stroke={color} strokeWidth="3" />
        <circle cx="376" cy="112" r="4" fill={color} />
        <line x1="376" y1="97" x2="376" y2="127" stroke={color} strokeWidth="2" opacity="0.7" />
        <line x1="361" y1="112" x2="391" y2="112" stroke={color} strokeWidth="2" opacity="0.7" />
      </g>
    </svg>
  );
}
