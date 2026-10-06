import { cache } from "react";
import type { ActivityLevel, BodyProfile, Goal, Sex } from "@/lib/calculations";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Profile = BodyProfile & {
  /** Nombre de sessions de batch cooking par semaine. */
  batchesPerWeek: number;
  /** Portions du stock mangées par jour (déjeuner + dîner = 2). */
  stockPortionsPerDay: number;
};

/** Profil de l'utilisateur connecté, ou null s'il n'a pas fini l'onboarding. */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "goal, sex, birth_year, height_cm, weight_kg, activity_level, batches_per_week, stock_portions_per_day",
    )
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    goal: data.goal as Goal,
    sex: data.sex as Sex,
    birthYear: data.birth_year,
    heightCm: Number(data.height_cm),
    weightKg: Number(data.weight_kg),
    activityLevel: data.activity_level as ActivityLevel,
    batchesPerWeek: data.batches_per_week,
    stockPortionsPerDay: Number(data.stock_portions_per_day),
  };
});
