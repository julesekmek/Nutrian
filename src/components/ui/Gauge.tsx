import type { ReactNode } from "react";

export type GaugeTone = "energy" | "protein" | "carbs" | "fat" | "primary" | "success";

const STROKE_CLASSES: Record<GaugeTone, string> = {
  energy: "stroke-energy",
  protein: "stroke-protein",
  carbs: "stroke-carbs",
  fat: "stroke-fat",
  primary: "stroke-primary",
  success: "stroke-success",
};

const TRACK_CLASSES: Record<GaugeTone, string> = {
  energy: "stroke-energy-soft",
  protein: "stroke-protein-soft",
  carbs: "stroke-carbs-soft",
  fat: "stroke-fat-soft",
  primary: "stroke-primary-soft",
  success: "stroke-success-soft",
};

const BAR_CLASSES: Record<GaugeTone, string> = {
  energy: "bg-energy",
  protein: "bg-protein",
  carbs: "bg-carbs",
  fat: "bg-fat",
  primary: "bg-primary",
  success: "bg-success",
};

const BAR_TRACK_CLASSES: Record<GaugeTone, string> = {
  energy: "bg-energy-soft",
  protein: "bg-protein-soft",
  carbs: "bg-carbs-soft",
  fat: "bg-fat-soft",
  primary: "bg-primary-soft",
  success: "bg-success-soft",
};

function ratio(value: number, max: number) {
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, value / max));
}

/** Anneau de progression façon Apple Fitness. Au-delà de 100 %, l'anneau reste plein. */
export function Ring({
  value,
  max,
  tone = "energy",
  size = 168,
  thickness = 16,
  children,
  label,
}: {
  value: number;
  max: number;
  tone?: GaugeTone;
  size?: number;
  thickness?: number;
  children?: ReactNode;
  label?: string;
}) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = ratio(value, max);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          className={TRACK_CLASSES[tone]}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          className={`${STROKE_CLASSES[tone]} transition-[stroke-dashoffset] duration-700`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}

/** Jauge horizontale (macros, stock…). */
export function ProgressBar({
  value,
  max,
  tone = "primary",
  label,
}: {
  value: number;
  max: number;
  tone?: GaugeTone;
  label?: string;
}) {
  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full ${BAR_TRACK_CLASSES[tone]}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={Math.round(max)}
      aria-valuenow={Math.round(value)}
    >
      <div
        className={`h-full rounded-full ${BAR_CLASSES[tone]} transition-[width] duration-700`}
        style={{ width: `${ratio(value, max) * 100}%` }}
      />
    </div>
  );
}

/** Ligne macro : libellé, consommé / cible, et jauge. */
export function MacroGauge({
  label,
  value,
  target,
  unit = "g",
  tone,
}: {
  label: string;
  value: number;
  target: number;
  unit?: string;
  tone: GaugeTone;
}) {
  const remaining = Math.round(target - value);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-callout font-semibold text-ink">{label}</span>
        <span className="text-footnote text-ink-muted">
          <span className="font-semibold text-ink">{Math.round(value)}</span> / {Math.round(target)} {unit}
        </span>
      </div>
      <ProgressBar value={value} max={target} tone={tone} label={label} />
      <span className="text-caption text-ink-muted">
        {remaining > 0 ? `Il reste ${remaining} ${unit}` : "Cible atteinte, bien joué"}
      </span>
    </div>
  );
}
