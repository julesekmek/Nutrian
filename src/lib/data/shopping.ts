import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Portions prévues par recette pour le prochain batch. */
export async function getShoppingPlan(): Promise<Record<string, number>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("shopping_plan_items").select("recipe_id, portions");
  if (error) throw error;
  return Object.fromEntries(data.map((row) => [row.recipe_id, row.portions]));
}

/** Aliments cochés comme achetés. */
export async function getShoppingChecks(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("shopping_checks").select("food_id");
  if (error) throw error;
  return data.map((row) => row.food_id);
}
