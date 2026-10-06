import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export function EmptyState({
  icon = "sparkle",
  title,
  description,
  action,
}: {
  icon?: IconName;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card bg-surface px-6 py-8 text-center shadow-card">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon name={icon} />
      </div>
      <div>
        <p className="text-headline text-ink">{title}</p>
        {description ? (
          <p className="mt-1 text-callout text-ink-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Oups, quelque chose a coincé",
  description = "Vérifie ta connexion puis réessaie.",
  action,
}: {
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-card bg-surface px-6 py-8 text-center shadow-card"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger">
        <Icon name="alert" />
      </div>
      <div>
        <p className="text-headline text-ink">{title}</p>
        <p className="mt-1 text-callout text-ink-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}

/** Bandeau d'erreur dans un formulaire. */
export function InlineError({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-control bg-danger-soft px-3 py-2 text-callout text-danger">
      {children}
    </p>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-card bg-surface-muted ${className}`} />;
}

export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Chargement">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-48" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>
  );
}
