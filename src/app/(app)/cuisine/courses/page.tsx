import type { Metadata } from "next";
import { getRecipes } from "@/lib/data/recipes";
import { getShoppingChecks, getShoppingPlan } from "@/lib/data/shopping";
import { CuisineHeader } from "../CuisineHeader";
import { ShoppingPlanner } from "./ShoppingPlanner";

export const metadata: Metadata = { title: "Courses" };

export default async function ShoppingPage() {
  const [recipes, plan, checked] = await Promise.all([
    getRecipes(),
    getShoppingPlan(),
    getShoppingChecks(),
  ]);

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
        suggestedPortions={null}
      />
    </>
  );
}
