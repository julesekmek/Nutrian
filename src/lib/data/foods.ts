import { cache } from "react";
import { categoryOrder, type Food, type FoodCategory } from "@/lib/foods";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Tous les aliments visibles (base commune + aliments perso), triés par catégorie puis nom. */
export const getFoods = cache(async (): Promise<Food[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("foods")
    .select("id, user_id, name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g")
    .order("name");
  if (error) throw error;

  return data
    .map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category as FoodCategory,
      kcal: Number(row.kcal_per_100g),
      proteinG: Number(row.protein_per_100g),
      carbsG: Number(row.carbs_per_100g),
      fatG: Number(row.fat_per_100g),
      isCustom: row.user_id !== null,
    }))
    .sort(
      (a, b) =>
        categoryOrder(a.category) - categoryOrder(b.category) || a.name.localeCompare(b.name, "fr"),
    );
});
