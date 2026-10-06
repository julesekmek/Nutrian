import type { Nutrients } from "@/lib/calculations";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type MealEntry = {
  id: string;
  eatenOn: string;
  source: "stock" | "quick";
  recipeId: string | null;
  name: string;
  portions: number;
  kcal: number;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
};

/** Repas enregistrés entre deux dates incluses (ISO), du plus ancien au plus récent. */
export async function getMealEntries(fromDay: string, toDay: string): Promise<MealEntry[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("meal_entries")
    .select("id, eaten_on, source, recipe_id, name, portions, kcal, protein_g, carbs_g, fat_g")
    .gte("eaten_on", fromDay)
    .lte("eaten_on", toDay)
    .order("eaten_on")
    .order("created_at");
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    eatenOn: row.eaten_on,
    source: row.source as MealEntry["source"],
    recipeId: row.recipe_id,
    name: row.name,
    portions: Number(row.portions),
    kcal: Number(row.kcal),
    proteinG: row.protein_g === null ? null : Number(row.protein_g),
    carbsG: row.carbs_g === null ? null : Number(row.carbs_g),
    fatG: row.fat_g === null ? null : Number(row.fat_g),
  }));
}

/** Apports d'un repas (macros non renseignées comptées à 0). */
export function mealNutrients(entry: MealEntry): Nutrients {
  return {
    kcal: entry.kcal,
    proteinG: entry.proteinG ?? 0,
    carbsG: entry.carbsG ?? 0,
    fatG: entry.fatG ?? 0,
  };
}
