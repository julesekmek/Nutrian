import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

/** Grand titre de page façon iOS, avec retour et action optionnels. */
export function PageHeader({
  title,
  subtitle,
  action,
  backHref,
  backLabel = "Retour",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className="pt-safe mb-section">
      {backHref ? (
        <Link
          href={backHref}
          className="mb-2 -ml-1 inline-flex items-center gap-0.5 pt-3 text-body text-primary"
        >
          <Icon name="chevronLeft" size={20} />
          {backLabel}
        </Link>
      ) : (
        <div className="pt-6" />
      )}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          {subtitle ? (
            <p className="text-footnote font-semibold uppercase tracking-wide text-ink-muted">
              {subtitle}
            </p>
          ) : null}
          <h1 className="text-title text-ink">{title}</h1>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}
