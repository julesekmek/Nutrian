"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  GENERIC_ERROR,
  failure,
  success,
  validationFailure,
  type ActionResult,
} from "@/lib/action-result";
import { getAuthenticatedClient } from "@/lib/auth";
import { currentYear } from "@/lib/dates";
import { formDataToObject, profileSchema, type ProfileInput } from "@/lib/validation";

function toProfileRow(input: ProfileInput) {
  return {
    goal: input.goal,
    sex: input.sex,
    birth_year: currentYear() - Math.round(input.age),
    height_cm: input.heightCm,
    weight_kg: input.weightKg,
    activity_level: input.activityLevel,
    updated_at: new Date().toISOString(),
  };
}

/** Fin de l'onboarding : crée le profil puis ouvre le tableau de bord. */
export async function completeOnboarding(formData: FormData): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);

  const { supabase, user } = await getAuthenticatedClient();
  const { error } = await supabase
    .from("profiles")
    .upsert({ user_id: user.id, ...toProfileRow(parsed.data) });
  if (error) return failure(GENERIC_ERROR);

  revalidatePath("/", "layout");
  redirect("/");
}

/** Modification du profil depuis l'onglet Profil. */
export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);

  const { supabase, user } = await getAuthenticatedClient();
  const { error } = await supabase
    .from("profiles")
    .update(toProfileRow(parsed.data))
    .eq("user_id", user.id);
  if (error) return failure(GENERIC_ERROR);

  revalidatePath("/", "layout");
  return success("Profil mis à jour, tes cibles sont recalculées.");
}
