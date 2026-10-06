"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionForm } from "@/components/ui/ActionForm";
import { Button } from "@/components/ui/Button";
import { NumberField } from "@/components/ui/Field";
import { estimateWorkoutKcal, type WorkoutKind } from "@/lib/calculations";
import { WORKOUT_KINDS } from "@/lib/labels";
import { logWorkout } from "./actions";

const QUICK_DURATIONS = [30, 45, 60, 90];

function chipClasses(selected: boolean) {
  return [
    "rounded-control border px-4 py-2 text-callout font-medium transition-colors",
    selected ? "border-primary bg-primary-soft text-primary" : "border-line bg-surface text-ink",
  ].join(" ");
}

/** Séance en quelques gestes : type, durée, kcal (estimées si la montre ne donne rien). */
export function WorkoutForm({ day, weightKg }: { day: "today" | "yesterday"; weightKg: number }) {
  const router = useRouter();
  const [kind, setKind] = useState<WorkoutKind>("strength");
  const [duration, setDuration] = useState("60");

  const durationMin = Number(duration.replace(",", "."));
  const estimate =
    Number.isFinite(durationMin) && durationMin > 0
      ? estimateWorkoutKcal({ kind, durationMin, weightKg })
      : null;

  return (
    <ActionForm action={logWorkout} onSuccess={() => router.push("/")}>
      {({ fieldErrors, pending }) => (
        <>
          <input type="hidden" name="day" value={day} />
          <input type="hidden" name="kind" value={kind} />
          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 px-1 text-footnote font-medium text-ink-muted">Type</legend>
            <div className="flex flex-wrap gap-2">
              {WORKOUT_KINDS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={kind === option.value}
                  onClick={() => setKind(option.value)}
                  className={chipClasses(kind === option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-col gap-2">
            <NumberField
              label="Durée"
              name="durationMin"
              suffix="min"
              inputMode="numeric"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              error={fieldErrors.durationMin}
            />
            <div className="flex gap-2">
              {QUICK_DURATIONS.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => setDuration(String(minutes))}
                  className={`flex-1 ${chipClasses(duration === String(minutes))} px-2`}
                >
                  {minutes}′
                </button>
              ))}
            </div>
          </div>
          <NumberField
            label="Énergie dépensée"
            name="kcal"
            suffix="kcal"
            inputMode="numeric"
            placeholder={estimate ? `≈ ${estimate}` : undefined}
            hint="Celle de ta montre si tu l'as, sinon on garde l'estimation."
            error={fieldErrors.kcal}
          />
          <Button type="submit" size="lg" fullWidth pending={pending}>
            Ajouter la séance
          </Button>
        </>
      )}
    </ActionForm>
  );
}
