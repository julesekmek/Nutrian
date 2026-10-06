import { MacroLine } from "@/components/MacroLine";
import type { Nutrients } from "@/lib/calculations";
import { formatInteger } from "@/lib/format";

/** Bloc « par portion / total » d'une recette. */
export function NutritionSummary({
  perServing,
  total,
  servings,
}: {
  perServing: Nutrients;
  total: Nutrients;
  servings: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-control bg-energy-soft px-3 py-3">
        <p className="text-footnote font-medium text-ink-muted">Par portion</p>
        <p className="text-title text-energy">{formatInteger(perServing.kcal)}</p>
        <p className="mb-1 text-footnote text-ink-muted">kcal</p>
        <p className="text-caption text-ink-muted">
          <MacroLine proteinG={perServing.proteinG} carbsG={perServing.carbsG} fatG={perServing.fatG} />
        </p>
      </div>
      <div className="rounded-control bg-surface-muted px-3 py-3">
        <p className="text-footnote font-medium text-ink-muted">
          Total ({servings} portion{servings > 1 ? "s" : ""})
        </p>
        <p className="text-title text-ink">{formatInteger(total.kcal)}</p>
        <p className="mb-1 text-footnote text-ink-muted">kcal</p>
        <p className="text-caption text-ink-muted">
          <MacroLine proteinG={total.proteinG} carbsG={total.carbsG} fatG={total.fatG} />
        </p>
      </div>
    </div>
  );
}
