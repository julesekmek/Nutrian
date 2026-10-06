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
import { foodSchema, formDataToObject, uuidSchema } from "@/lib/validation";

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
