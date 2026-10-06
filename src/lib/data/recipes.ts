import { cache } from "react";
import { recipeNutrition, type Nutrients } from "@/lib/calculations";
import { FOOD_COLUMNS, toFood } from "@/lib/data/foods";
import type { Food } from "@/lib/foods";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RecipeIngredient = { food: Food; grams: number };

export type Recipe = {
  id: string;
  name: string;
  servings: number;
  ingredients: RecipeIngredient[];
  total: Nutrients;
  perServing: Nutrients;
};

const RECIPE_COLUMNS = `id, name, servings, recipe_ingredients (grams, position, foods (${FOOD_COLUMNS}))`;

type RecipeRow = {
  id: string;
  name: string;
  servings: number;
  recipe_ingredients: {
    grams: number;
    position: number;
    foods: Parameters<typeof toFood>[0] | null;
  }[];
};

function toRecipe(row: RecipeRow): Recipe {
  const ingredients = [...row.recipe_ingredients]
    .sort((a, b) => a.position - b.position)
    .filter((ingredient) => ingredient.foods !== null)
    .map((ingredient) => ({
      food: toFood(ingredient.foods!),
      grams: Number(ingredient.grams),
    }));
  const { total, perServing } = recipeNutrition(
    ingredients.map(({ food, grams }) => ({ grams, per100g: food })),
    row.servings,
  );
  return { id: row.id, name: row.name, servings: row.servings, ingredients, total, perServing };
}

/** Recettes de l'utilisateur, avec macros calculées, triées par nom. */
export const getRecipes = cache(async (): Promise<Recipe[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("recipes").select(RECIPE_COLUMNS).order("name");
  if (error) throw error;
  return (data as unknown as RecipeRow[]).map(toRecipe);
});

export async function getRecipe(id: string): Promise<Recipe | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("recipes")
    .select(RECIPE_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toRecipe(data as unknown as RecipeRow) : null;
}
