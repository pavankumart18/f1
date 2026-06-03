export function StatTile({
  value,
  label,
  accent,
}: {
  value: string | number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="border border-rule px-3 py-3 text-center">
      <div
        className={`font-display text-3xl font-semibold tabular-nums leading-none sm:text-4xl ${
          accent ? "text-accent" : ""
        }`}
      >
        {value}
      </div>
      <div className="kicker mt-1.5">{label}</div>
    </div>
  );
}
