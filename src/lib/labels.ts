import type { ActivityLevel, Goal, Sex, WorkoutKind } from "@/lib/calculations";

export const GOALS: { value: Goal; label: string; description: string }[] = [
  { value: "bulk", label: "Prise de masse", description: "Un léger surplus pour construire du muscle." },
  { value: "maintain", label: "Maintien", description: "Garder ton poids et performer." },
  { value: "cut", label: "Perte de gras", description: "Un déficit modéré qui préserve le muscle." },
];

export const SEXES: { value: Sex; label: string }[] = [
  { value: "male", label: "Homme" },
  { value: "female", label: "Femme" },
];

export const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: "sedentary", label: "Sédentaire", description: "Travail assis, peu ou pas de sport." },
  { value: "light", label: "Légère", description: "1 à 2 séances par semaine." },
  { value: "moderate", label: "Modérée", description: "3 à 4 séances par semaine." },
  { value: "active", label: "Active", description: "5 à 6 séances par semaine." },
  { value: "very_active", label: "Très active", description: "Sport quotidien ou métier physique." },
];

export const WORKOUT_KINDS: { value: WorkoutKind; label: string }[] = [
  { value: "strength", label: "Musculation" },
  { value: "running", label: "Course" },
  { value: "crossfit", label: "CrossFit" },
  { value: "other", label: "Autre" },
];

export function labelOf<T extends string>(
  options: { value: T; label: string }[],
  value: T,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}
