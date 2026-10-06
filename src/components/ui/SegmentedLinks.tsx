import Link from "next/link";

export type SegmentLink = { href: string; label: string; active: boolean };

/** Contrôle segmenté dont l'onglet actif est fourni par la page (ex. paramètre d'URL). */
export function SegmentedLinks({
  items,
  label,
  size = "md",
}: {
  items: SegmentLink[];
  label: string;
  size?: "sm" | "md";
}) {
  return (
    <nav className="flex rounded-control bg-surface-muted p-1" aria-label={label}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          replace
          scroll={false}
          aria-current={item.active ? "page" : undefined}
          className={[
            "flex-1 rounded-control px-2 text-center font-semibold transition-colors",
            size === "sm" ? "py-1 text-caption" : "py-1.5 text-footnote",
            item.active ? "bg-surface text-ink shadow-card" : "text-ink-muted",
          ].join(" ")}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
