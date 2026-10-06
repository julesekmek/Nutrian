import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={`rounded-card bg-surface p-4 shadow-card ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-3 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-headline text-ink">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-footnote text-ink-muted">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}

/** Titre de section façon iOS (petites capitales au-dessus d'une carte ou d'une liste). */
export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center justify-between px-1">
      <h2 className="text-footnote font-semibold uppercase tracking-wide text-ink-muted">
        {children}
      </h2>
      {action}
    </div>
  );
}
