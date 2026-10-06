"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Segment = { href: string; label: string; exact?: boolean };

/** Contrôle segmenté de navigation (sous-onglets d'une section). */
export function SegmentedNav({ segments }: { segments: Segment[] }) {
  const pathname = usePathname();
  return (
    <nav className="mb-section flex rounded-control bg-surface-muted p-1" aria-label="Sous-navigation">
      {segments.map((segment) => {
        const active = segment.exact
          ? pathname === segment.href
          : pathname === segment.href || pathname.startsWith(`${segment.href}/`);
        return (
          <Link
            key={segment.href}
            href={segment.href}
            aria-current={active ? "page" : undefined}
            className={[
              "flex-1 rounded-control px-2 py-1.5 text-center text-footnote font-semibold transition-colors",
              active ? "bg-surface text-ink shadow-card" : "text-ink-muted",
            ].join(" ")}
          >
            {segment.label}
          </Link>
        );
      })}
    </nav>
  );
}
