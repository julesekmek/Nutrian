import type { DayActivity, WorkoutKind } from "@/lib/calculations";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Workout = {
  id: string;
  day: string;
  kind: WorkoutKind;
  durationMin: number;
  kcal: number;
};

export type ActivityLog = {
  /** Pas saisis par jour (ISO). */
  stepsByDay: Map<string, number>;
  workouts: Workout[];
};

/** Pas et séances saisis entre deux dates incluses. */
export async function getActivity(fromDay: string, toDay: string): Promise<ActivityLog> {
  const supabase = await createSupabaseServerClient();
  const [steps, workouts] = await Promise.all([
    supabase.from("daily_steps").select("day, steps").gte("day", fromDay).lte("day", toDay),
    supabase
      .from("workouts")
      .select("id, day, kind, duration_min, kcal")
      .gte("day", fromDay)
      .lte("day", toDay)
      .order("day", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);
  if (steps.error) throw steps.error;
  if (workouts.error) throw workouts.error;

  return {
    stepsByDay: new Map(steps.data.map((row) => [row.day, row.steps])),
    workouts: workouts.data.map((row) => ({
      id: row.id,
      day: row.day,
      kind: row.kind as WorkoutKind,
      durationMin: row.duration_min,
      kcal: row.kcal,
    })),
  };
}

/** Activité d'un jour au format attendu par le module de calcul. */
export function dayActivity(log: ActivityLog, day: string): DayActivity {
  return {
    steps: log.stepsByDay.get(day) ?? null,
    workouts: log.workouts.filter((workout) => workout.day === day),
  };
}
