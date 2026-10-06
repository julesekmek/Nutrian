import { cache } from "react";
import type { Nutrients } from "@/lib/calculations";
import { getRecipes } from "@/lib/data/recipes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type StockItem = {
  recipeId: string;
  name: string;
  servings: number;
  portionsLeft: number;
  lastPreparedOn: string | null;
  perServing: Nutrients;
};

/** Stock par recette (toutes les recettes, y compris celles à 0 portion), du plus fourni au moins fourni. */
export const getStock = cache(async (): Promise<StockItem[]> => {
  const supabase = await createSupabaseServerClient();
  const [{ data, error }, recipes] = await Promise.all([
    supabase.from("recipe_stock").select("recipe_id, portions_left, last_prepared_on"),
    getRecipes(),
  ]);
  if (error) throw error;

  const stockByRecipe = new Map(data.map((row) => [row.recipe_id, row]));
  return recipes
    .map((recipe) => {
      const row = stockByRecipe.get(recipe.id);
      return {
        recipeId: recipe.id,
        name: recipe.name,
        servings: recipe.servings,
        portionsLeft: Math.max(0, Number(row?.portions_left ?? 0)),
        lastPreparedOn: row?.last_prepared_on ?? null,
        perServing: recipe.perServing,
      };
    })
    .sort((a, b) => b.portionsLeft - a.portionsLeft || a.name.localeCompare(b.name, "fr"));
});

export type Preparation = {
  id: string;
  recipeId: string;
  recipeName: string;
  portions: number;
  preparedOn: string;
};

export async function getRecentPreparations(limit = 10): Promise<Preparation[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("preparations")
    .select("id, recipe_id, portions, prepared_on, recipes (name)")
    .order("prepared_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    recipeId: row.recipe_id,
    recipeName: row.recipes?.name ?? "Recette supprimée",
    portions: row.portions,
    preparedOn: row.prepared_on,
  }));
}

/** Date de la dernière préparation (toutes recettes confondues), ou null. */
export async function getLastPreparationDate(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("preparations")
    .select("prepared_on")
    .order("prepared_on", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.prepared_on ?? null;
}
