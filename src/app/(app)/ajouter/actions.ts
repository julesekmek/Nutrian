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
import { estimateWorkoutKcal } from "@/lib/calculations";
import { getProfile } from "@/lib/data/profile";
import { getRecipe } from "@/lib/data/recipes";
import { dayFromChoice } from "@/lib/dates";
import {
  formDataToObject,
  quickMealSchema,
  stepsSchema,
  stockMealSchema,
  uuidSchema,
  workoutSchema,
} from "@/lib/validation";

const round1 = (value: number) => Math.round(value * 10) / 10;

function refreshAll() {
  revalidatePath("/", "layout");
}

// --- Repas --------------------------------------------------------------------

/** Pioche une portion dans le stock : le repas est ajouté au journal et le stock décrémenté. */
export async function logStockPortion(
  recipeId: string,
  day: string,
): Promise<ActionResult<{ entryId: string }>> {
  const parsed = stockMealSchema.safeParse({ recipeId, day });
  if (!parsed.success) return failure("Plat introuvable.");

  const { supabase, user } = await getAuthenticatedClient();
  const [recipe, stock] = await Promise.all([
    getRecipe(parsed.data.recipeId),
    supabase
      .from("recipe_stock")
      .select("portions_left")
      .eq("recipe_id", parsed.data.recipeId)
      .maybeSingle(),
  ]);
  if (!recipe) return failure("Plat introuvable.");
  if (stock.error) return failure(GENERIC_ERROR);
  if (Number(stock.data?.portions_left ?? 0) < 1) {
    return failure(`Plus de portion de ${recipe.name} en stock.`);
  }

  const { data, error } = await supabase
    .from("meal_entries")
    .insert({
      user_id: user.id,
      eaten_on: dayFromChoice(parsed.data.day),
      source: "stock",
      recipe_id: recipe.id,
      portions: 1,
      name: recipe.name,
      kcal: round1(recipe.perServing.kcal),
      protein_g: round1(recipe.perServing.proteinG),
      carbs_g: round1(recipe.perServing.carbsG),
      fat_g: round1(recipe.perServing.fatG),
    })
    .select("id")
    .single();
  if (error) return failure(GENERIC_ERROR);

  refreshAll();
  return success(`Bien joué, ${recipe.name} est noté.`, { entryId: data.id });
}

/** Repas hors stock : nom + kcal, macros facultatives. */
export async function logQuickMeal(formData: FormData): Promise<ActionResult<{ entryId: string }>> {
  const parsed = quickMealSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);

  const { name, kcal, proteinG, carbsG, fatG, day } = parsed.data;
  const { supabase, user } = await getAuthenticatedClient();
  const { data, error } = await supabase
    .from("meal_entries")
    .insert({
      user_id: user.id,
      eaten_on: dayFromChoice(day),
      source: "quick",
      name,
      kcal: Math.round(kcal),
      protein_g: proteinG === undefined ? null : round1(proteinG),
      carbs_g: carbsG === undefined ? null : round1(carbsG),
      fat_g: fatG === undefined ? null : round1(fatG),
    })
    .select("id")
    .single();
  if (error) return failure(GENERIC_ERROR);

  refreshAll();
  return success(`${name} ajouté à ton journal.`, { entryId: data.id });
}

/** Supprime un repas ; s'il venait du stock, la portion y retourne automatiquement. */
export async function deleteMealEntry(entryId: string): Promise<ActionResult> {
  const id = uuidSchema.safeParse(entryId);
  if (!id.success) return failure("Repas introuvable.");

  const { supabase, user } = await getAuthenticatedClient();
  const { data, error } = await supabase
    .from("meal_entries")
    .delete()
    .eq("id", id.data)
    .eq("user_id", user.id)
    .select("source")
    .maybeSingle();
  if (error || !data) return failure(GENERIC_ERROR);

  refreshAll();
  return success(
    data.source === "stock" ? "Repas retiré, la portion revient dans ton stock." : "Repas retiré.",
  );
}

// --- Activité -------------------------------------------------------------------

export async function saveSteps(formData: FormData): Promise<ActionResult> {
  const parsed = stepsSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);

  const { supabase, user } = await getAuthenticatedClient();
  const { error } = await supabase.from("daily_steps").upsert({
    user_id: user.id,
    day: dayFromChoice(parsed.data.day),
    steps: parsed.data.steps,
    updated_at: new Date().toISOString(),
  });
  if (error) return failure(GENERIC_ERROR);

  refreshAll();
  return success(
    parsed.data.steps >= 10000 ? "Bien joué, plus de 10 000 pas !" : "Pas enregistrés, chaque pas compte.",
  );
}

/** Séance : kcal saisies (montre) ou, à défaut, estimées avec les MET et le poids actuel. */
export async function logWorkout(formData: FormData): Promise<ActionResult> {
  const parsed = workoutSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);

  const { kind, durationMin, day } = parsed.data;
  const { supabase, user } = await getAuthenticatedClient();
  let kcal = parsed.data.kcal;
  if (kcal === undefined) {
    const profile = await getProfile();
    kcal = estimateWorkoutKcal({ kind, durationMin, weightKg: profile?.weightKg ?? 70 });
  }

  const { error } = await supabase.from("workouts").insert({
    user_id: user.id,
    day: dayFromChoice(day),
    kind,
    duration_min: durationMin,
    kcal: Math.round(kcal),
  });
  if (error) return failure(GENERIC_ERROR);

  refreshAll();
  return success(`Séance enregistrée : ${Math.round(kcal)} kcal dépensées, bien joué !`);
}

export async function deleteWorkout(workoutId: string): Promise<ActionResult> {
  const id = uuidSchema.safeParse(workoutId);
  if (!id.success) return failure("Séance introuvable.");

  const { supabase, user } = await getAuthenticatedClient();
  const { error, count } = await supabase
    .from("workouts")
    .delete({ count: "exact" })
    .eq("id", id.data)
    .eq("user_id", user.id);
  if (error || count === 0) return failure(GENERIC_ERROR);

  refreshAll();
  return success("Séance retirée.");
}
