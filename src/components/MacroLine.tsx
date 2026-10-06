import { formatDecimal } from "@/lib/format";

const round1 = (value: number) => Math.round(value * 10) / 10;

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
    <span className="inline-flex flex-wrap gap-x-2">
      <span className="whitespace-nowrap">
        <span className="font-semibold text-protein">P</span> {formatDecimal(round1(proteinG))} g
      </span>
      <span className="whitespace-nowrap">
        <span className="font-semibold text-carbs">G</span> {formatDecimal(round1(carbsG))} g
      </span>
      <span className="whitespace-nowrap">
        <span className="font-semibold text-fat">L</span> {formatDecimal(round1(fatG))} g
      </span>
    </span>
  );
}
