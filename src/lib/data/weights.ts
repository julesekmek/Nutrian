import { createSupabaseServerClient, type SupabaseServerClient } from "@/lib/supabase/server";

export type WeighIn = { id: string; day: string; weightKg: number };

/** Pesées les plus récentes d'abord. */
export async function getWeighIns(limit = 26): Promise<WeighIn[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("weigh_ins")
    .select("id, day, weight_kg")
    .order("day", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data.map((row) => ({ id: row.id, day: row.day, weightKg: Number(row.weight_kg) }));
}

/** Recopie la pesée la plus récente dans le profil : les cibles sont recalculées avec ce poids. */
export async function syncProfileWeight(supabase: SupabaseServerClient, userId: string) {
  const { data, error } = await supabase
    .from("weigh_ins")
    .select("weight_kg")
    .order("day", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return error;
  if (!data) return null;
  const update = await supabase
    .from("profiles")
    .update({ weight_kg: data.weight_kg, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  return update.error;
}
