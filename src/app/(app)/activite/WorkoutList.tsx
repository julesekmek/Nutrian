"use client";

import { Icon } from "@/components/ui/Icon";
import { List, ListItem } from "@/components/ui/List";
import { ConfirmButton } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { Workout } from "@/lib/data/activity";
import { formatRelativeDay } from "@/lib/dates";
import { formatInteger } from "@/lib/format";
import { WORKOUT_KINDS, labelOf } from "@/lib/labels";
import { deleteWorkout } from "../ajouter/actions";

export function WorkoutList({ workouts, today }: { workouts: Workout[]; today: string }) {
  const toast = useToast();

  async function remove(workout: Workout) {
    const result = await deleteWorkout(workout.id);
    if (result.ok) toast.success(result.message ?? "Séance retirée.");
    else toast.error(result.error);
  }

  return (
    <List>
      {workouts.map((workout) => {
        const label = labelOf(WORKOUT_KINDS, workout.kind);
        return (
          <ListItem
            key={workout.id}
            leading={
              <span className="flex size-9 items-center justify-center rounded-full bg-energy-soft text-energy">
                <Icon name="workout" size={18} />
              </span>
            }
            title={label}
            subtitle={`${formatRelativeDay(workout.day, today)} · ${workout.durationMin} min`}
            trailing={
              <span className="flex items-center gap-1">
                {formatInteger(workout.kcal)} kcal
                <ConfirmButton
                  title={`Retirer la séance « ${label} » ?`}
                  confirmLabel="Retirer"
                  ariaLabel={`Retirer la séance ${label}`}
                  onConfirm={() => remove(workout)}
                >
                  <Icon name="trash" size={18} />
                </ConfirmButton>
              </span>
            }
          />
        );
      })}
    </List>
  );
}
