import type { Metadata } from "next";
import { batchPlan } from "@/lib/calculations";
import { getProfile } from "@/lib/data/profile";
import { getRecipes } from "@/lib/data/recipes";
import { getShoppingChecks, getShoppingPlan } from "@/lib/data/shopping";
import { getLastPreparationDate, getStock } from "@/lib/data/stock";
import { daysBetween, todayIso } from "@/lib/dates";
import { CuisineHeader } from "../CuisineHeader";
import { ShoppingPlanner } from "./ShoppingPlanner";

export const metadata: Metadata = { title: "Courses" };

export default async function ShoppingPage() {
  const [recipes, plan, checked, stock, lastPreparation, profile] = await Promise.all([
    getRecipes(),
    getShoppingPlan(),
    getShoppingChecks(),
    getStock(),
    getLastPreparationDate(),
    getProfile(),
  ]);

  const batch = batchPlan({
    stockPortions: stock.reduce((sum, item) => sum + item.portionsLeft, 0),
    portionsPerDay: profile?.stockPortionsPerDay ?? 2,
    batchesPerWeek: profile?.batchesPerWeek ?? 2,
    daysSinceLastBatch: lastPreparation ? daysBetween(lastPreparation, todayIso()) : null,
  });
  // Ce qu'il manque dès maintenant, sinon ce qu'il faudra pour l'intervalle suivant.
  const suggestedPortions = Math.max(batch.missingNow, batch.nextBatchPortions) || null;

  return (
    <>
      <CuisineHeader />
      <ShoppingPlanner
        recipes={recipes.map((recipe) => ({
          id: recipe.id,
          name: recipe.name,
          servings: recipe.servings,
          ingredients: recipe.ingredients.map((ingredient) => ({
            foodId: ingredient.food.id,
            foodName: ingredient.food.name,
            category: ingredient.food.category,
            grams: ingredient.grams,
          })),
        }))}
        initialPlan={plan}
        initialChecked={checked}
        suggestedPortions={suggestedPortions}
      />
    </>
  );
}
