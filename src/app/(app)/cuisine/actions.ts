"use server";

import { revalidatePath } from "next/cache";
import {
  GENERIC_ERROR,
  failure,
  success,
  validationFailure,
  type ActionResult,
} from "@/lib/action-result";
import { getAuthenticatedClient } from "@/lib/auth";
import { kcalFromMacros } from "@/lib/calculations";
import { todayIso } from "@/lib/dates";
import {
  foodSchema,
  formDataToObject,
  planItemSchema,
  preparationSchema,
  recipeSchema,
  shoppingCheckSchema,
  uuidSchema,
} from "@/lib/validation";

const FOREIGN_KEY_VIOLATION = "23503";

function refreshAll() {
  revalidatePath("/", "layout");
}

// --- Aliments -----------------------------------------------------------------

export async function createFood(formData: FormData): Promise<ActionResult> {
  const parsed = foodSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);

  const { name, category, proteinG, carbsG, fatG } = parsed.data;
  const kcal = parsed.data.kcal ?? Math.round(kcalFromMacros({ proteinG, carbsG, fatG }));
  if (kcal > 950) return failure("Ces valeurs dépassent ce qu'un aliment peut contenir pour 100 g.");

  const { supabase, user } = await getAuthenticatedClient();
  const { error } = await supabase.from("foods").insert({
    user_id: user.id,
    name,
    category,
    kcal_per_100g: kcal,
    protein_per_100g: proteinG,
    carbs_per_100g: carbsG,
    fat_per_100g: fatG,
  });
  if (error) return failure(GENERIC_ERROR);

  refreshAll();
  return success(`${name} ajouté à tes aliments.`);
}

export async function deleteFood(foodId: string): Promise<ActionResult> {
  const id = uuidSchema.safeParse(foodId);
  if (!id.success) return failure("Aliment introuvable.");

  const { supabase, user } = await getAuthenticatedClient();
  const { error, count } = await supabase
    .from("foods")
    .delete({ count: "exact" })
    .eq("id", id.data)
    .eq("user_id", user.id);
  if (error?.code === FOREIGN_KEY_VIOLATION) {
    return failure("Cet aliment est utilisé dans une recette : retire-le d'abord de la recette.");
  }
  if (error || count === 0) return failure(GENERIC_ERROR);

  refreshAll();
  return success("Aliment supprimé.");
}

// --- Recettes -----------------------------------------------------------------

export async function saveRecipe(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const parsed = recipeSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);

  const { id, name, servings, ingredients } = parsed.data;
  const { supabase } = await getAuthenticatedClient();
  const { data, error } = await supabase.rpc("save_recipe", {
    p_name: name,
    p_servings: servings,
    p_ingredients: ingredients.map((ingredient) => ({
      food_id: ingredient.foodId,
      grams: Math.round(ingredient.grams * 10) / 10,
    })),
    p_recipe_id: id,
  });
  if (error || !data) return failure(GENERIC_ERROR);

  refreshAll();
  return success(id ? "Recette mise à jour." : `${name} est prête à cuisiner !`, { id: data });
}

export async function deleteRecipe(recipeId: string): Promise<ActionResult> {
  const id = uuidSchema.safeParse(recipeId);
  if (!id.success) return failure("Recette introuvable.");

  const { supabase, user } = await getAuthenticatedClient();
  const { error, count } = await supabase
    .from("recipes")
    .delete({ count: "exact" })
    .eq("id", id.data)
    .eq("user_id", user.id);
  if (error || count === 0) return failure(GENERIC_ERROR);

  refreshAll();
  return success("Recette supprimée.");
}

// --- Stock --------------------------------------------------------------------

export async function createPreparation(formData: FormData): Promise<ActionResult> {
  const parsed = preparationSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);

  const { supabase, user } = await getAuthenticatedClient();
  const { error } = await supabase.from("preparations").insert({
    user_id: user.id,
    recipe_id: parsed.data.recipeId,
    portions: parsed.data.portions,
    prepared_on: parsed.data.preparedOn,
  });
  if (error) return failure(GENERIC_ERROR);

  refreshAll();
  return success(`Bien joué, ${parsed.data.portions} portion${parsed.data.portions > 1 ? "s" : ""} au frais !`);
}

export async function deletePreparation(preparationId: string): Promise<ActionResult> {
  const id = uuidSchema.safeParse(preparationId);
  if (!id.success) return failure("Préparation introuvable.");

  const { supabase, user } = await getAuthenticatedClient();
  const { error, count } = await supabase
    .from("preparations")
    .delete({ count: "exact" })
    .eq("id", id.data)
    .eq("user_id", user.id);
  if (error || count === 0) return failure(GENERIC_ERROR);

  refreshAll();
  return success("Préparation retirée du stock.");
}

// --- Liste de courses -----------------------------------------------------------

/** Fixe les portions prévues d'une recette pour le prochain batch (0 = retirer du plan). */
export async function setPlanPortions(recipeId: string, portions: number): Promise<ActionResult> {
  const parsed = planItemSchema.safeParse({ recipeId, portions });
  if (!parsed.success) return failure("Valeur invalide.");

  const { supabase, user } = await getAuthenticatedClient();
  const { error } =
    parsed.data.portions === 0
      ? await supabase
          .from("shopping_plan_items")
          .delete()
          .eq("user_id", user.id)
          .eq("recipe_id", parsed.data.recipeId)
      : await supabase.from("shopping_plan_items").upsert({
          user_id: user.id,
          recipe_id: parsed.data.recipeId,
          portions: parsed.data.portions,
        });
  if (error) return failure(GENERIC_ERROR);
  return success();
}

export async function toggleShoppingCheck(foodId: string, checked: boolean): Promise<ActionResult> {
  const parsed = shoppingCheckSchema.safeParse({ foodId, checked });
  if (!parsed.success) return failure("Valeur invalide.");

  const { supabase, user } = await getAuthenticatedClient();
  const { error } = parsed.data.checked
    ? await supabase
        .from("shopping_checks")
        .upsert({ user_id: user.id, food_id: parsed.data.foodId })
    : await supabase
        .from("shopping_checks")
        .delete()
        .eq("user_id", user.id)
        .eq("food_id", parsed.data.foodId);
  if (error) return failure(GENERIC_ERROR);
  return success();
}

async function clearPlanAndChecks(
  supabase: Awaited<ReturnType<typeof getAuthenticatedClient>>["supabase"],
  userId: string,
) {
  const [plan, checks] = await Promise.all([
    supabase.from("shopping_plan_items").delete().eq("user_id", userId),
    supabase.from("shopping_checks").delete().eq("user_id", userId),
  ]);
  return plan.error ?? checks.error;
}

export async function clearShoppingList(): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticatedClient();
  if (await clearPlanAndChecks(supabase, user.id)) return failure(GENERIC_ERROR);
  refreshAll();
  return success("Liste vidée, prête pour le prochain batch.");
}

/** Après le batch : les portions prévues passent en stock, la liste est remise à zéro. */
export async function completeBatch(): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticatedClient();
  const { data: plan, error } = await supabase
    .from("shopping_plan_items")
    .select("recipe_id, portions");
  if (error) return failure(GENERIC_ERROR);
  if (plan.length === 0) return failure("Ta liste ne contient aucune recette.");

  const today = todayIso();
  const { error: insertError } = await supabase.from("preparations").insert(
    plan.map((item) => ({
      user_id: user.id,
      recipe_id: item.recipe_id,
      portions: item.portions,
      prepared_on: today,
    })),
  );
  if (insertError) return failure(GENERIC_ERROR);
  if (await clearPlanAndChecks(supabase, user.id)) return failure(GENERIC_ERROR);

  const total = plan.reduce((sum, item) => sum + item.portions, 0);
  refreshAll();
  return success(`Bien joué ! ${total} portion${total > 1 ? "s" : ""} ajoutée${total > 1 ? "s" : ""} au stock.`);
}
