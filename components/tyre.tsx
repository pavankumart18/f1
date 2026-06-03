import { COMPOUND_COLOR } from "@/lib/f1/openf1";

export function Tyre({
  compound = "SOFT",
  size = 22,
}: {
  compound?: keyof typeof COMPOUND_COLOR | string;
  size?: number;
}) {
  const color = COMPOUND_COLOR[compound] ?? "#888";
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        border: `${Math.max(2, size / 8)}px solid ${color}`,
        background: "var(--ink)",
      }}
      title={compound}
    >
      <span
        className="rounded-full"
        style={{ width: size / 4, height: size / 4, background: color }}
      />
    </span>
  );
}

// Decorative pit-garage divider — a rule flanked by tyre compounds.
export function TyreDivider({ label }: { label?: string }) {
  const compounds = ["SOFT", "MEDIUM", "HARD", "INTERMEDIATE", "WET"];
  return (
    <div className="my-8 flex items-center gap-4">
      <span className="h-px flex-1 bg-rule" />
      <div className="flex items-center gap-2">
        {compounds.map((c) => (
          <Tyre key={c} compound={c} size={18} />
        ))}
      </div>
      {label && (
        <span className="kicker whitespace-nowrap">{label}</span>
      )}
      <span className="h-px flex-1 bg-rule" />
    </div>
  );
}
