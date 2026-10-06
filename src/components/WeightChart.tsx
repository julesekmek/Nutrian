import type { WeighIn } from "@/lib/data/weights";
import { formatShortDate } from "@/lib/dates";
import { formatDecimal } from "@/lib/format";

const WIDTH = 320;
const HEIGHT = 120;
const PADDING = 12;

/** Courbe simple des dernières pesées (de la plus ancienne à la plus récente). */
export function WeightChart({ weighIns }: { weighIns: WeighIn[] }) {
  const points = [...weighIns].reverse();
  if (points.length < 2) return null;

  const weights = points.map((point) => point.weightKg);
  const min = Math.min(...weights) - 0.5;
  const max = Math.max(...weights) + 0.5;
  const x = (index: number) => PADDING + (index / (points.length - 1)) * (WIDTH - PADDING * 2);
  const y = (weight: number) => PADDING + ((max - weight) / (max - min)) * (HEIGHT - PADDING * 2);
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${x(index)},${y(point.weightKg)}`).join(" ");
  const last = points[points.length - 1];

  return (
    <figure>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-32 w-full"
        role="img"
        aria-label={`Évolution du poids : de ${formatDecimal(points[0].weightKg)} kg à ${formatDecimal(last.weightKg)} kg`}
      >
        <path d={path} fill="none" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="stroke-primary" />
        {points.map((point, index) => (
          <circle key={point.id} cx={x(index)} cy={y(point.weightKg)} r={index === points.length - 1 ? 5 : 3} className="fill-primary" />
        ))}
      </svg>
      <figcaption className="flex justify-between text-caption text-ink-subtle">
        <span>{formatShortDate(points[0].day)}</span>
        <span>{formatShortDate(last.day)}</span>
      </figcaption>
    </figure>
  );
}
