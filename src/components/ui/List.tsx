import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./Icon";

/** Liste groupée façon iOS : séparateurs fins, fond carte. */
export function List({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <ul className={`divide-y divide-line overflow-hidden rounded-card bg-surface shadow-card ${className}`}>
      {children}
    </ul>
  );
}

type ListItemProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  href?: string;
  chevron?: boolean;
};

export function ListItem({ title, subtitle, leading, trailing, href, chevron }: ListItemProps) {
  const content = (
    <div className="flex min-h-14 items-center gap-3 px-4 py-2.5">
      {leading ? <div className="shrink-0">{leading}</div> : null}
      <div className="min-w-0 flex-1">
        <div className="truncate text-body text-ink">{title}</div>
        {subtitle ? (
          <div className="text-footnote text-ink-muted">{subtitle}</div>
        ) : null}
      </div>
      {trailing ? <div className="shrink-0 text-callout text-ink-muted">{trailing}</div> : null}
      {chevron || href ? (
        <Icon name="chevronRight" size={18} className="shrink-0 text-ink-subtle" />
      ) : null}
    </div>
  );

  return (
    <li>
      {href ? (
        <Link href={href} className="block active:bg-surface-muted">
          {content}
        </Link>
      ) : (
        content
      )}
    </li>
  );
}
