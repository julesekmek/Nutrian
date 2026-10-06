import { formatDecimal } from "@/lib/format";

/** Résumé compact « P 24 g · G 0 g · L 1,5 g ». */
export function MacroLine({
  proteinG,
  carbsG,
  fatG,
}: {
  proteinG: number;
  carbsG: number;
  fatG: number;
}) {
  return (
    <span className="inline-flex gap-2">
      <span>
        <span className="font-semibold text-protein">P</span> {formatDecimal(Math.round(proteinG * 10) / 10)} g
      </span>
      <span>
        <span className="font-semibold text-carbs">G</span> {formatDecimal(Math.round(carbsG * 10) / 10)} g
      </span>
      <span>
        <span className="font-semibold text-fat">L</span> {formatDecimal(Math.round(fatG * 10) / 10)} g
      </span>
    </span>
  );
}
