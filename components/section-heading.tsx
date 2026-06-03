import Link from "next/link";

export function SectionHeading({
  label,
  title,
  href,
  hrefLabel = "View all",
}: {
  label?: string;
  title: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-3 flex items-end justify-between border-b border-rule-strong pb-2">
      <div>
        {label && <div className="kicker mb-1">{label}</div>}
        <h2 className="font-display text-xl font-semibold leading-none tracking-tight sm:text-2xl">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft hover:text-accent"
        >
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}
