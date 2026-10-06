import { cache } from "react";
import { categoryOrder, type Food, type FoodCategory } from "@/lib/foods";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const FOOD_COLUMNS =
  "id, user_id, name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g";

type FoodRow = {
  id: string;
  user_id: string | null;
  name: string;
  category: string;
  kcal_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
};

export function toFood(row: FoodRow): Food {
  return {
    id: row.id,
    name: row.name,
    category: row.category as FoodCategory,
    kcal: Number(row.kcal_per_100g),
    proteinG: Number(row.protein_per_100g),
    carbsG: Number(row.carbs_per_100g),
    fatG: Number(row.fat_per_100g),
    isCustom: row.user_id !== null,
  };
}

/** Tous les aliments visibles (base commune + aliments perso), triés par catégorie puis nom. */
export const getFoods = cache(async (): Promise<Food[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("foods")
    .select(FOOD_COLUMNS)
    .order("name");
  if (error) throw error;

  return data
    .map(toFood)
    .sort(
      (a, b) =>
        categoryOrder(a.category) - categoryOrder(b.category) || a.name.localeCompare(b.name, "fr"),
    );
});
