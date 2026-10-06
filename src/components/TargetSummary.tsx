import type { MacroTargets } from "@/lib/calculations";
import { formatInteger } from "@/lib/format";

const MACROS = [
  { key: "proteinG", label: "Protéines", dot: "bg-protein" },
  { key: "carbsG", label: "Glucides", dot: "bg-carbs" },
  { key: "fatG", label: "Lipides", dot: "bg-fat" },
] as const;

/** Cible quotidienne : kcal en grand + les trois macros. */
export function TargetSummary({ targets }: { targets: MacroTargets }) {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="text-center">
        <p className="text-display text-energy">{formatInteger(targets.kcal)}</p>
        <p className="text-callout text-ink-muted">kcal par jour</p>
      </div>
      <dl className="grid w-full grid-cols-3 gap-2">
        {MACROS.map((macro) => (
          <div key={macro.key} className="rounded-control bg-surface-muted px-2 py-3 text-center">
            <dt className="flex items-center justify-center gap-1.5 text-footnote text-ink-muted">
              <span className={`size-2 rounded-full ${macro.dot}`} aria-hidden="true" />
              {macro.label}
            </dt>
            <dd className="mt-1 text-headline text-ink">{formatInteger(targets[macro.key])} g</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
