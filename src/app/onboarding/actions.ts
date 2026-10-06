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
import { currentYear, todayIso } from "@/lib/dates";
import {
  batchSettingsSchema,
  formDataToObject,
  profileSchema,
  type ProfileInput,
} from "@/lib/validation";

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

async function recordWeighIn(
  supabase: Awaited<ReturnType<typeof getAuthenticatedClient>>["supabase"],
  userId: string,
  weightKg: number,
) {
  await supabase
    .from("weigh_ins")
    .upsert(
      { user_id: userId, day: todayIso(), weight_kg: Math.round(weightKg * 10) / 10 },
      { onConflict: "user_id,day" },
    );
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
  // Le poids de l'onboarding devient la première pesée de l'historique.
  await recordWeighIn(supabase, user.id, parsed.data.weightKg);

  revalidatePath("/", "layout");
  redirect("/");
}

/** Modification du profil depuis l'onglet Profil. */
export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);

  const { supabase, user } = await getAuthenticatedClient();
  const { data: current } = await supabase.from("profiles").select("weight_kg").maybeSingle();
  const { error } = await supabase
    .from("profiles")
    .update(toProfileRow(parsed.data))
    .eq("user_id", user.id);
  if (error) return failure(GENERIC_ERROR);
  // Un poids modifié dans le profil compte comme une pesée du jour.
  if (current && Number(current.weight_kg) !== parsed.data.weightKg) {
    await recordWeighIn(supabase, user.id, parsed.data.weightKg);
  }

  revalidatePath("/", "layout");
  return success("Profil mis à jour, tes cibles sont recalculées.");
}

/** Rythme de batch cooking (utilisé par les recommandations du coach). */
export async function updateBatchSettings(formData: FormData): Promise<ActionResult> {
  const parsed = batchSettingsSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);

  const { supabase, user } = await getAuthenticatedClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      batches_per_week: parsed.data.batchesPerWeek,
      stock_portions_per_day: parsed.data.stockPortionsPerDay,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);
  if (error) return failure(GENERIC_ERROR);

  revalidatePath("/", "layout");
  return success("Rythme de batch cooking enregistré.");
}
